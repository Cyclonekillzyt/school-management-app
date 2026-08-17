


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "private"."teacher_completion_ranking"() RETURNS TABLE("teacher_id" "uuid", "teacher_name" "text", "scores_entered" bigint, "total_students" bigint, "completion_percentage" numeric, "teacher_rank" bigint, "teacher_position" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
with score_fields_cfg as (
  select count(*)::bigint as total_student_fields
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'scores'
    and column_name in ('classwork','groupwork','projectwork','test','exam_score')
),
teacher_totals as (
  select
    tw.teacher_id,
    sum(tw.scores_entered) as scores_entered,
    sum(tw.total_students) as total_students,
    case
      when sum(tw.total_students) = 0 then 0
      else round(
        (
          sum(tw.scores_entered)::numeric
          / (sum(tw.total_students)::numeric * cfg.total_student_fields)
        ) * 100,
        2
      )
    end as completion_percentage
  from public.teacher_workload_view tw
  cross join score_fields_cfg cfg
  group by tw.teacher_id, cfg.total_student_fields
),
teachers as (
  select p.id as teacher_id, p.full_name as teacher_name
  from public.profiles p
  where p.role = 'teacher'
),
ranked as (
  select
    t.teacher_id,
    t.teacher_name,
    coalesce(tt.scores_entered, 0) as scores_entered,
    coalesce(tt.total_students, 0) as total_students,
    coalesce(tt.completion_percentage, 0) as completion_percentage,
    dense_rank() over (
      order by coalesce(tt.completion_percentage, 0) desc
    ) as teacher_rank
  from teachers t
  left join teacher_totals tt
    on tt.teacher_id = t.teacher_id
)
select
  r.teacher_id,
  r.teacher_name,
  r.scores_entered,
  r.total_students,
  r.completion_percentage,
  r.teacher_rank,
  case
    when r.teacher_rank % 100 in (11, 12, 13) then concat(r.teacher_rank::text, 'th')
    when r.teacher_rank % 10 = 1 then concat(r.teacher_rank::text, 'st')
    when r.teacher_rank % 10 = 2 then concat(r.teacher_rank::text, 'nd')
    when r.teacher_rank % 10 = 3 then concat(r.teacher_rank::text, 'rd')
    else concat(r.teacher_rank::text, 'th')
  end as teacher_position
from ranked r
order by r.teacher_rank, r.teacher_name;
$$;


ALTER FUNCTION "private"."teacher_completion_ranking"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid") RETURNS TABLE("student_id" "uuid", "student_name" "text", "classwork" numeric, "groupwork" numeric, "projectwork" numeric, "test" numeric, "exam_score" numeric, "grand_total" numeric, "grade" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_class_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  select ta.class_id
    into v_class_id
    from public.teacher_assignments ta
   where ta.id = p_assignment_id;

  return query
  select
    s.id,
    s.full_name,
    srv.classwork,
    srv.groupwork,
    srv.projectwork,
    srv.test,
    srv.exam_score,
    srv.grand_total,
    srv.grade
  from public.students s
  left join public.student_result_view srv
    on srv.student_id = s.id
   and srv.teacher_assignment_id = p_assignment_id
  where s.class_id = v_class_id
    and s.active = true
  order by s.full_name;
end;
$$;


ALTER FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid", "p_term" "text" DEFAULT NULL::"text") RETURNS TABLE("student_id" "uuid", "student_name" "text", "classwork" numeric, "groupwork" numeric, "projectwork" numeric, "test" numeric, "exam_score" numeric, "grand_total" numeric, "grade" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_class_id uuid;
  v_term text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  v_term := coalesce(p_term, public.current_term_name());
  select ta.class_id into v_class_id from public.teacher_assignments ta where ta.id = p_assignment_id;

  return query
  select
    st.id as student_id,
    st.full_name as student_name,
    srv.classwork,
    srv.groupwork,
    srv.projectwork,
    srv.test,
    srv.exam_score,
    srv.grand_total,
    srv.grade
  from public.students st
  left join public.student_result_view srv
    on srv.student_id = st.id
   and srv.teacher_assignment_id = p_assignment_id
   and srv.term = v_term
  where st.class_id = v_class_id
    and st.active = true
  order by st.full_name;
end;
$$;


ALTER FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid", "p_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_bulk_import_assignments"("payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  rec jsonb;
  v_teacher_id uuid;
  v_subject_id uuid;
  v_class_id uuid;
  v_academic_year_id uuid;
  v_inserted int := 0;
  v_failed int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_idx int := 0;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  for rec in select * from jsonb_array_elements(payload)
  loop
    v_idx := v_idx + 1;

    select p.id into v_teacher_id
    from public.profiles p
    where lower(p.email) = lower(trim(rec->>'teacher_email'))
      and p.role = 'teacher'
    limit 1;

    select sub.id into v_subject_id
    from public.subjects sub
    where lower(sub.name) = lower(trim(rec->>'subject_name'))
    limit 1;

    select c.id into v_class_id
    from public.classes c
    where lower(c.name) = lower(trim(rec->>'class_name'))
    limit 1;

    if rec->>'academic_year_name' is not null and trim(rec->>'academic_year_name') <> '' then
      select ay.id into v_academic_year_id
      from public.academic_years ay
      where lower(ay.name) = lower(trim(rec->>'academic_year_name'))
      limit 1;
    else
      select ay.id into v_academic_year_id
      from public.academic_years ay
      where ay.current = true
      limit 1;
    end if;

    if v_teacher_id is null
       or v_subject_id is null
       or v_class_id is null
       or v_academic_year_id is null then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object(
        'row', v_idx,
        'reason', 'Could not resolve teacher / subject / class / academic year'
      );
      continue;
    end if;

    if exists (
      select 1
      from public.teacher_assignments ta
      where ta.teacher_id = v_teacher_id
        and ta.subject_id = v_subject_id
        and ta.class_id = v_class_id
        and ta.academic_year_id = v_academic_year_id
    ) then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object('row', v_idx, 'reason', 'Assignment already exists');
      continue;
    end if;

    insert into public.teacher_assignments (teacher_id, subject_id, class_id, academic_year_id)
    values (v_teacher_id, v_subject_id, v_class_id, v_academic_year_id);

    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'failed', v_failed, 'errors', v_errors);
end;
$$;


ALTER FUNCTION "public"."admin_bulk_import_assignments"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_bulk_import_classes"("payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  rec jsonb;
  v_class_teacher_id uuid;
  v_class_id uuid;
  v_inserted int := 0;
  v_failed int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_idx int := 0;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  for rec in select jsonb_array_elements(payload)
  loop
    v_idx := v_idx + 1;

    if coalesce(trim(rec->>'name'), '') = '' then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object('row', v_idx, 'reason', 'Missing class name');
      continue;
    end if;

    if exists (
      select 1
        from public.classes c
       where lower(c.name) = lower(trim(rec->>'name'))
    ) then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object(
        'row', v_idx,
        'reason', 'Class already exists: ' || (rec->>'name')
      );
      continue;
    end if;

    v_class_teacher_id := null;
    if rec->>'class_teacher_email' is not null and trim(rec->>'class_teacher_email') <> '' then
      select pr.id
        into v_class_teacher_id
        from public.profiles pr
       where lower(pr.email) = lower(trim(rec->>'class_teacher_email'))
         and pr.role = 'teacher'
       limit 1;
    end if;

    insert into public.classes (name, class_teacher_id)
    values (trim(rec->>'name'), v_class_teacher_id)
    returning public.classes.id into v_class_id;

    perform public.log_activity('class_created', 'class', v_class_id, trim(rec->>'name'));

    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object(
    'inserted', v_inserted,
    'failed', v_failed,
    'errors', v_errors
  );
end;
$$;


ALTER FUNCTION "public"."admin_bulk_import_classes"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_bulk_import_students"("payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  rec jsonb;
  v_class_id uuid;
  v_inserted int := 0;
  v_failed int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_idx int := 0;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  for rec in select * from jsonb_array_elements(payload)
  loop
    v_idx := v_idx + 1;

    if coalesce(trim(rec->>'full_name'), '') = '' then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object('row', v_idx, 'reason', 'Missing student name');
      continue;
    end if;

    select c.id into v_class_id
    from public.classes c
    where lower(c.name) = lower(trim(rec->>'class_name'))
    limit 1;

    if v_class_id is null then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object(
        'row', v_idx,
        'reason', 'Class not found: ' || coalesce(rec->>'class_name', '')
      );
      continue;
    end if;

    insert into public.students (full_name, class_id, active)
    values (trim(rec->>'full_name'), v_class_id, true);

    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'failed', v_failed, 'errors', v_errors);
end;
$$;


ALTER FUNCTION "public"."admin_bulk_import_students"("payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_class_broadsheet"("p_class_id" "uuid") RETURNS TABLE("student_id" "uuid", "student_name" "text", "subject_name" "text", "grand_total" numeric, "grade" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    s.id as student_id,
    s.full_name as student_name,
    sub.name as subject_name,
    srv.grand_total,
    srv.grade
  from public.students s
  cross join public.teacher_assignments ta
  join public.subjects sub
    on sub.id = ta.subject_id
  left join public.student_result_view srv
    on srv.student_id = s.id
   and srv.teacher_assignment_id = ta.id
  where s.class_id = p_class_id
    and ta.class_id = p_class_id
    and s.active = true
  order by s.full_name, sub.name;
end;
$$;


ALTER FUNCTION "public"."admin_class_broadsheet"("p_class_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_class_students"("p_class_id" "uuid") RETURNS TABLE("student_id" "uuid", "student_name" "text", "average_score" numeric, "position" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  return query
  with per_student as (
    select
      s.id as student_id,
      s.full_name as student_name,
      round(avg(srv.grand_total), 2) as average_score
    from public.students s
    left join public.student_result_view srv
      on srv.student_id = s.id
     and srv.grand_total is not null
     and srv.term = public.current_term_name()
    where s.class_id = p_class_id
      and s.active = true
    group by s.id, s.full_name
  )
  select
    ps.student_id,
    ps.student_name,
    ps.average_score,
    rank() over (order by ps.average_score desc nulls last) as "position"
  from per_student ps
  order by "position";
end;
$$;


ALTER FUNCTION "public"."admin_class_students"("p_class_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_class_subjects"("p_class_id" "uuid") RETURNS TABLE("assignment_id" "uuid", "subject_id" "uuid", "subject_name" "text", "teacher_id" "uuid", "teacher_name" "text", "average_score" numeric, "completion_percentage" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    ta.id,
    s.id,
    s.name,
    p.id,
    p.full_name,
    (select round(avg(srv.grand_total), 2)
       from public.student_result_view srv
      where srv.teacher_assignment_id = ta.id and srv.grand_total is not null),
    w.grand_total_completion_percentage
  from public.teacher_assignments ta
  join public.subjects s on s.id = ta.subject_id
  join public.profiles p on p.id = ta.teacher_id
  left join public.teacher_workload_dashboard_view w on w.assignment_id = ta.id
  where ta.class_id = p_class_id
  order by s.name;
end;
$$;


ALTER FUNCTION "public"."admin_class_subjects"("p_class_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_class_summary"("p_class_id" "uuid") RETURNS TABLE("class_id" "uuid", "class_name" "text", "total_students" bigint, "average_score" numeric, "completion_percentage" numeric, "class_teacher_id" "uuid", "class_teacher_name" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  return query
  select
    c.id,
    c.name,
    (select count(*) from public.students s where s.class_id = c.id and s.active = true),
    (select round(avg(srv.grand_total), 2) from public.student_result_view srv
       where srv.class_id = c.id and srv.grand_total is not null and srv.term = public.current_term_name()),
    (select round(avg(w.grand_total_completion_percentage), 2) from public.teacher_workload_dashboard_view w
       where w.class_name = c.name),
    c.class_teacher_id,
    p.full_name
  from public.classes c
  left join public.profiles p on p.id = c.class_teacher_id
  where c.id = p_class_id;
end;
$$;


ALTER FUNCTION "public"."admin_class_summary"("p_class_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_classes_overview"() RETURNS TABLE("class_id" "uuid", "class_name" "text", "total_students" bigint, "total_subjects" bigint, "average_score" numeric, "completion_percentage" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  return query
  with student_counts as (
    select st.class_id, count(*) as total_students
      from public.students st
     where st.active = true
     group by st.class_id
  ),
  subject_counts as (
    select ta.class_id, count(distinct ta.subject_id) as total_subjects
      from public.teacher_assignments ta
     group by ta.class_id
  ),
  averages as (
    select srv.class_id, round(avg(srv.grand_total), 2) as average_score
      from public.student_result_view srv
     where srv.grand_total is not null
       and srv.term = public.current_term_name()
     group by srv.class_id
  ),
  completion as (
    select c.id as class_id, round(avg(w.grand_total_completion_percentage), 2) as completion_percentage
      from public.classes c
      left join public.teacher_workload_dashboard_view w on w.class_name = c.name
     group by c.id
  )
  select
    c.id,
    c.name,
    coalesce(sc.total_students, 0),
    coalesce(subc.total_subjects, 0),
    a.average_score,
    comp.completion_percentage
  from public.classes c
  left join student_counts sc on sc.class_id = c.id
  left join subject_counts subc on subc.class_id = c.id
  left join averages a on a.class_id = c.id
  left join completion comp on comp.class_id = c.id
  order by c.name;
end;
$$;


ALTER FUNCTION "public"."admin_classes_overview"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_classes_picker"() RETURNS TABLE("class_id" "uuid", "class_name" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select c.id, c.name
    from public.classes c
   order by c.name;
end;
$$;


ALTER FUNCTION "public"."admin_classes_picker"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_completion_summary"() RETURNS TABLE("teachers_completed" bigint, "teachers_pending" bigint, "classes_completed" bigint, "classes_pending" bigint, "assignments_pending" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  with teacher_status as (
    select twd.teacher_id as teacher_id,
           min(twd.grand_total_completion_percentage) as min_completion
    from public.teacher_workload_dashboard_view twd
    group by twd.teacher_id
  ),
  class_status as (
    select c.id as class_id,
           min(twd2.grand_total_completion_percentage) as min_completion
    from public.classes c
    left join public.teacher_workload_dashboard_view twd2
      on twd2.class_name = c.name
    group by c.id
  )
  select
    (select count(*) filter (where ts.min_completion >= 100) from teacher_status ts),
    (select count(*) filter (where ts.min_completion < 100 or ts.min_completion is null) from teacher_status ts),
    (select count(*) filter (where cs.min_completion >= 100) from class_status cs),
    (select count(*) filter (where cs.min_completion < 100 or cs.min_completion is null) from class_status cs),
    (select count(*)
     from public.teacher_workload_dashboard_view twd3
     where twd3.grand_total_completion_percentage is null
        or twd3.grand_total_completion_percentage < 100);
end;
$$;


ALTER FUNCTION "public"."admin_completion_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_assignment"("p_teacher_id" "uuid", "p_subject_id" "uuid", "p_class_id" "uuid", "p_academic_year_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_year_id uuid;
  v_id uuid;
  v_label text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  v_year_id := p_academic_year_id;
  if v_year_id is null then
    select ay.id into v_year_id
      from public.academic_years ay
     where ay.current = true
     limit 1;
  end if;
  if v_year_id is null then raise exception 'No academic year specified and no active academic year found'; end if;

  if exists (
    select 1
      from public.teacher_assignments ta
     where ta.teacher_id = p_teacher_id
       and ta.subject_id = p_subject_id
       and ta.class_id = p_class_id
       and ta.academic_year_id = v_year_id
  ) then
    raise exception 'This teacher is already assigned to this subject and class for this academic year';
  end if;

  insert into public.teacher_assignments (teacher_id, subject_id, class_id, academic_year_id)
  values (p_teacher_id, p_subject_id, p_class_id, v_year_id)
  returning public.teacher_assignments.id into v_id;

  select
    pr.full_name || ' · ' || sub.name || ' · ' || c.name
    into v_label
    from public.profiles pr
    join public.subjects sub on sub.id = p_subject_id
    join public.classes c on c.id = p_class_id
   where pr.id = p_teacher_id;

  perform public.log_activity('assignment_created', 'assignment', v_id, v_label);
  return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_create_assignment"("p_teacher_id" "uuid", "p_subject_id" "uuid", "p_class_id" "uuid", "p_academic_year_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_class"("p_name" "text", "p_class_teacher_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Class name is required'; end if;

  insert into public.classes (name, class_teacher_id)
  values (trim(p_name), p_class_teacher_id)
  returning public.classes.id into v_id;

  perform public.log_activity('class_created', 'class', v_id, trim(p_name));
  return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_create_class"("p_name" "text", "p_class_teacher_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_student"("p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text" DEFAULT NULL::"text", "p_gender" "text" DEFAULT NULL::"text", "p_date_of_birth" "date" DEFAULT NULL::"date", "p_parent_name" "text" DEFAULT NULL::"text", "p_parent_phone" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_full_name), '') = '' then raise exception 'Student name is required'; end if;

  insert into public.students (
    full_name, class_id, admission_number, gender, date_of_birth, parent_name,
    parent_phone, address, active
  )
  values (
    trim(p_full_name), p_class_id,
    nullif(trim(p_admission_number), ''), nullif(trim(p_gender), ''),
    p_date_of_birth,
    nullif(trim(p_parent_name), ''), nullif(trim(p_parent_phone), ''),
    nullif(trim(p_address), ''),
    true
  )
  returning public.students.id into v_id;

  perform public.log_activity('student_created', 'student', v_id, trim(p_full_name));
  return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_create_student"("p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_subject"("p_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Subject name is required'; end if;

  insert into public.subjects (name)
  values (trim(p_name))
  returning public.subjects.id into v_id;

  perform public.log_activity('subject_created', 'subject', v_id, trim(p_name));
  return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_create_subject"("p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_dashboard_summary"() RETURNS TABLE("total_students" bigint, "total_teachers" bigint, "total_classes" bigint, "total_subjects" bigint, "total_assignments" bigint, "current_academic_year" "text", "current_term" "text", "teachers_completed" bigint, "teachers_pending" bigint, "top_class_name" "text", "top_class_average" numeric, "lowest_class_name" "text", "lowest_class_average" numeric, "top_teacher_name" "text", "top_teacher_average" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  with counts as (
    select
      (select count(*) from public.students where active = true) as total_students,
      (select count(*) from public.profiles where role = 'teacher') as total_teachers,
      (select count(*) from public.classes) as total_classes,
      (select count(*) from public.subjects) as total_subjects,
      (select count(*) from public.teacher_assignments) as total_assignments
  ),
  period as (
    select
      (select name from public.academic_years where current = true limit 1) as current_academic_year,
      (select name from public.terms where is_current = true limit 1) as current_term
  ),
  teacher_status as (
    select
      count(*) filter (where min_completion >= 100) as teachers_completed,
      count(*) filter (where min_completion < 100 or min_completion is null) as teachers_pending
    from (
      select teacher_id, min(grand_total_completion_percentage) as min_completion
      from public.teacher_workload_dashboard_view
      group by teacher_id
    ) t
  ),
  class_perf as (
    select student_result_view.class_name, round(avg(grand_total), 2) as avg_score
    from public.student_result_view
    cross join period
    where grand_total is not null
      and (period.current_term is null or student_result_view.term = period.current_term)
    group by student_result_view.class_name
  ),
  top_class as (
    select class_name, avg_score from class_perf order by avg_score desc nulls last limit 1
  ),
  lowest_class as (
    select class_name, avg_score from class_perf order by avg_score asc nulls last limit 1
  ),
  top_teacher as (
    select teacher_name, average_score
    from public.teacher_performance_dashboard_view
    order by teacher_rank asc nulls last
    limit 1
  )
  select
    c.total_students, c.total_teachers, c.total_classes, c.total_subjects, c.total_assignments,
    p.current_academic_year, p.current_term,
    ts.teachers_completed, ts.teachers_pending,
    tc.class_name, tc.avg_score,
    lc.class_name, lc.avg_score,
    tt.teacher_name, tt.average_score
  from counts c
  left join period p on true
  left join teacher_status ts on true
  left join top_class tc on true
  left join lowest_class lc on true
  left join top_teacher tt on true;
end;
$$;


ALTER FUNCTION "public"."admin_dashboard_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_assignment"("p_assignment_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_label text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  if exists (
    select 1
      from public.scores sc
     where sc.teacher_assignment_id = p_assignment_id
  ) then
    raise exception 'Cannot remove this assignment: scores have already been entered against it';
  end if;

  select
    pr.full_name || ' · ' || sub.name || ' · ' || c.name
    into v_label
    from public.teacher_assignments ta
    join public.profiles pr on pr.id = ta.teacher_id
    join public.subjects sub on sub.id = ta.subject_id
    join public.classes c on c.id = ta.class_id
   where ta.id = p_assignment_id;

  delete from public.teacher_assignments ta
        where ta.id = p_assignment_id;

  perform public.log_activity('assignment_removed', 'assignment', p_assignment_id, v_label);
end;
$$;


ALTER FUNCTION "public"."admin_delete_assignment"("p_assignment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_log_export"("p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  perform public.log_activity('export_generated', p_entity_type, p_entity_id, p_entity_label);
end;
$$;


ALTER FUNCTION "public"."admin_log_export"("p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_recent_activity"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "actor_name" "text", "action" "text", "entity_type" "text", "entity_label" "text", "metadata" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    al.id,
    al.actor_name,
    al.action,
    al.entity_type,
    al.entity_label,
    al.metadata,
    al.created_at
  from public.activity_log al
  order by al.created_at desc
  limit p_limit;
end;
$$;


ALTER FUNCTION "public"."admin_recent_activity"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_academic_year_archived"("p_id" "uuid", "p_archived" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.academic_years ay
     set ay.archived = p_archived
   where ay.id = p_id;

  select ay.name into v_name from public.academic_years ay where ay.id = p_id;

  perform public.log_activity(
    case when p_archived then 'academic_year_archived' else 'academic_year_unarchived' end,
    'academic_year',
    p_id,
    v_name
  );
end;
$$;


ALTER FUNCTION "public"."admin_set_academic_year_archived"("p_id" "uuid", "p_archived" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_active_academic_year"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.academic_years ay
     set ay.current = false
   where ay.current = true;

  update public.academic_years ay
     set ay.current = true,
         ay.archived = false
   where ay.id = p_id;

  select ay.name into v_name from public.academic_years ay where ay.id = p_id;
  perform public.log_activity('academic_year_activated', 'academic_year', p_id, v_name);
end;
$$;


ALTER FUNCTION "public"."admin_set_active_academic_year"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_active_term"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.terms t
     set t.is_current = false
   where t.is_current = true;

  update public.terms t
     set t.is_current = true
   where t.id = p_id;

  select t.name into v_name from public.terms t where t.id = p_id;
  perform public.log_activity('term_activated', 'term', p_id, v_name);
end;
$$;


ALTER FUNCTION "public"."admin_set_active_term"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_student_active"("p_student_id" "uuid", "p_active" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  select st.full_name into v_name from public.students st where st.id = p_student_id;
  update public.students st
     set st.active = p_active
   where st.id = p_student_id;

  perform public.log_activity(
    case when p_active then 'student_reactivated' else 'student_deactivated' end,
    'student',
    p_student_id,
    v_name
  );
end;
$$;


ALTER FUNCTION "public"."admin_set_student_active"("p_student_id" "uuid", "p_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_teacher_active"("p_teacher_id" "uuid", "p_active" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  update public.profiles pr
     set pr.active = p_active
   where pr.id = p_teacher_id;
end;
$$;


ALTER FUNCTION "public"."admin_set_teacher_active"("p_teacher_id" "uuid", "p_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_term_open"("p_id" "uuid", "p_open" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.terms t
     set t.is_open = p_open
   where t.id = p_id;

  select t.name into v_name from public.terms t where t.id = p_id;

  perform public.log_activity(
    case when p_open then 'term_opened' else 'term_closed' end,
    'term',
    p_id,
    v_name
  );
end;
$$;


ALTER FUNCTION "public"."admin_set_term_open"("p_id" "uuid", "p_open" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_student_profile"("p_student_id" "uuid") RETURNS TABLE("student_id" "uuid", "student_name" "text", "class_id" "uuid", "class_name" "text", "active" boolean, "admission_number" "text", "gender" "text", "date_of_birth" "date", "parent_name" "text", "parent_phone" "text", "address" "text", "overall_average" numeric, "class_position" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_class_id uuid;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  select st.class_id into v_class_id from public.students st where st.id = p_student_id;

  return query
  with per_student as (
    select
      st.id as student_id,
      round(avg(srv.grand_total), 2) as avg_score
    from public.students st
    left join public.student_result_view srv
      on srv.student_id = st.id
     and srv.grand_total is not null
     and srv.term = public.current_term_name()
    where st.class_id = v_class_id
      and st.active = true
    group by st.id
  ),
  ranked as (
    select
      ps.student_id,
      ps.avg_score,
      rank() over (order by ps.avg_score desc nulls last) as position
    from per_student ps
  )
  select
    s.id as student_id,
    s.full_name as student_name,
    s.class_id,
    c.name as class_name,
    s.active,
    s.admission_number,
    s.gender,
    s.date_of_birth,
    s.parent_name,
    s.parent_phone,
    s.address,
    r.avg_score as overall_average,
    r.position::bigint as class_position
  from public.students s
  join public.classes c on c.id = s.class_id
  left join ranked r on r.student_id = s.id
  where s.id = p_student_id;
end;
$$;


ALTER FUNCTION "public"."admin_student_profile"("p_student_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_student_rankings"("p_class_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 100) RETURNS TABLE("student_id" "uuid", "student_name" "text", "class_id" "uuid", "class_name" "text", "average_score" numeric, "position" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  return query
  with per_student as (
    select
      st.id as student_id,
      st.full_name as student_name,
      c.id as class_id,
      c.name as class_name,
      round(avg(srv.grand_total), 2) as average_score
    from public.students st
    join public.classes c on c.id = st.class_id
    left join public.student_result_view srv
      on srv.student_id = st.id
     and srv.grand_total is not null
     and srv.term = public.current_term_name()
    where st.active = true
      and (p_class_id is null or st.class_id = p_class_id)
    group by st.id, st.full_name, c.id, c.name
  )
  select
    ps.student_id,
    ps.student_name,
    ps.class_id,
    ps.class_name,
    ps.average_score,
    rank() over (order by ps.average_score desc nulls last) as "position"
  from per_student ps
  order by "position"
  limit p_limit;
end;
$$;


ALTER FUNCTION "public"."admin_student_rankings"("p_class_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid") RETURNS TABLE("subject_id" "uuid", "subject_name" "text", "teacher_name" "text", "term" "text", "classwork" numeric, "groupwork" numeric, "projectwork" numeric, "test" numeric, "exam_score" numeric, "grand_total" numeric, "grade" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    srv.subject_id,
    srv.subject_name,
    p.full_name as teacher_name,
    srv.term,
    srv.classwork,
    srv.groupwork,
    srv.projectwork,
    srv.test,
    srv.exam_score,
    srv.grand_total,
    srv.grade
  from public.student_result_view srv
  join public.teacher_assignments ta
    on ta.id = srv.teacher_assignment_id
  join public.profiles p
    on p.id = ta.teacher_id
  where srv.student_id = p_student_id
  order by srv.subject_name;
end;
$$;


ALTER FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid", "p_term" "text" DEFAULT NULL::"text") RETURNS TABLE("subject_id" "uuid", "subject_name" "text", "teacher_name" "text", "term" "text", "classwork" numeric, "groupwork" numeric, "projectwork" numeric, "test" numeric, "exam_score" numeric, "grand_total" numeric, "grade" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_term text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  v_term := coalesce(p_term, public.current_term_name());

  return query
  select
    srv.subject_id,
    srv.subject_name,
    pr.full_name as teacher_name,
    srv.term,
    srv.classwork,
    srv.groupwork,
    srv.projectwork,
    srv.test,
    srv.exam_score,
    srv.grand_total,
    srv.grade
  from public.student_result_view srv
  join public.teacher_assignments ta on ta.id = srv.teacher_assignment_id
  join public.profiles pr on pr.id = ta.teacher_id
  where srv.student_id = p_student_id
    and srv.term = v_term
  order by srv.subject_name;
end;
$$;


ALTER FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid", "p_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_subject_performance"() RETURNS TABLE("subject_id" "uuid", "subject_name" "text", "average_score" numeric, "total_assignments" bigint, "total_students" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    s.id,
    s.name,
    (
      select round(avg(srv.grand_total), 2)
      from public.student_result_view srv
      where srv.subject_id = s.id
        and srv.grand_total is not null
    ),
    (
      select count(*)
      from public.teacher_assignments ta
      where ta.subject_id = s.id
    ),
    (
      select count(distinct st.id)
      from public.teacher_assignments ta
      join public.students st
        on st.class_id = ta.class_id
       and st.active = true
      where ta.subject_id = s.id
    )
  from public.subjects s
  order by s.name;
end;
$$;


ALTER FUNCTION "public"."admin_subject_performance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_subjects_picker"() RETURNS TABLE("subject_id" "uuid", "subject_name" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select s.id, s.name
    from public.subjects s
   order by s.name;
end;
$$;


ALTER FUNCTION "public"."admin_subjects_picker"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_teacher_assignments"("p_teacher_id" "uuid") RETURNS TABLE("assignment_id" "uuid", "class_id" "uuid", "class_name" "text", "subject_id" "uuid", "subject_name" "text", "total_students" bigint, "completion_percentage" numeric, "average_score" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    ta.id,
    c.id,
    c.name,
    s.id,
    s.name,
    (select count(*) from public.students st where st.class_id = ta.class_id and st.active = true),
    w.grand_total_completion_percentage,
    (select round(avg(srv.grand_total), 2)
       from public.student_result_view srv
      where srv.teacher_assignment_id = ta.id and srv.grand_total is not null)
  from public.teacher_assignments ta
  join public.classes c on c.id = ta.class_id
  join public.subjects s on s.id = ta.subject_id
  left join public.teacher_workload_dashboard_view w on w.assignment_id = ta.id
  where ta.teacher_id = p_teacher_id
  order by c.name, s.name;
end;
$$;


ALTER FUNCTION "public"."admin_teacher_assignments"("p_teacher_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_teacher_summary"("p_teacher_id" "uuid") RETURNS TABLE("teacher_id" "uuid", "teacher_name" "text", "email" "text", "gender" "text", "joined_at" timestamp with time zone, "active" boolean, "total_assignments" bigint, "total_students" bigint, "completion_percentage" numeric, "average_score" numeric, "teacher_rank" bigint, "teacher_position" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select
    o.teacher_id,
    o.teacher_name,
    o.email,
    o.gender,
    p.created_at as joined_at,
    p.active,
    o.total_assignments,
    o.total_students,
    o.completion_percentage,
    o.average_score,
    o.teacher_rank,
    o.teacher_position
  from public.admin_teachers_overview() o
  join public.profiles p
    on p.id = o.teacher_id
  where o.teacher_id = p_teacher_id;
end;
$$;


ALTER FUNCTION "public"."admin_teacher_summary"("p_teacher_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_teachers_overview"() RETURNS TABLE("teacher_id" "uuid", "teacher_name" "text", "email" "text", "gender" "text", "total_assignments" bigint, "total_students" bigint, "completion_percentage" numeric, "average_score" numeric, "teacher_rank" bigint, "teacher_position" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  with assignment_counts as (
    select ta.teacher_id, count(*) as total_assignments
    from public.teacher_assignments ta
    group by ta.teacher_id
  ),
  student_counts as (
    select ta.teacher_id, count(distinct s.id) as total_students
    from public.teacher_assignments ta
    join public.students s on s.class_id = ta.class_id and s.active = true
    group by ta.teacher_id
  ),
  completion as (
    select tw.teacher_id, round(avg(tw.grand_total_completion_percentage), 2) as completion_percentage
    from public.teacher_workload_dashboard_view tw
    group by tw.teacher_id
  ),
  perf as (
    select tp.teacher_id, tp.teacher_rank, tp.teacher_position, tp.average_score
    from public.teacher_performance_dashboard_view tp
  )
  select
    p.id,
    p.full_name,
    p.email,
    p.gender,
    coalesce(ac.total_assignments, 0),
    coalesce(sc.total_students, 0),
    comp.completion_percentage,
    perf.average_score,
    perf.teacher_rank,
    perf.teacher_position
  from public.profiles p
  left join assignment_counts ac on ac.teacher_id = p.id
  left join student_counts sc on sc.teacher_id = p.id
  left join completion comp on comp.teacher_id = p.id
  left join perf on perf.teacher_id = p.id
  where p.role = 'teacher'
  order by p.full_name;
end;
$$;


ALTER FUNCTION "public"."admin_teachers_overview"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_teachers_picker"() RETURNS TABLE("teacher_id" "uuid", "teacher_name" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select pr.id, pr.full_name
    from public.profiles pr
   where pr.role = 'teacher'
   order by pr.full_name;
end;
$$;


ALTER FUNCTION "public"."admin_teachers_picker"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_class"("p_class_id" "uuid", "p_name" "text", "p_class_teacher_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Class name is required'; end if;

  update public.classes c
     set c.name = trim(p_name),
         c.class_teacher_id = p_class_teacher_id
   where c.id = p_class_id;

  perform public.log_activity('class_updated', 'class', p_class_id, trim(p_name));
end;
$$;


ALTER FUNCTION "public"."admin_update_class"("p_class_id" "uuid", "p_name" "text", "p_class_teacher_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_student"("p_student_id" "uuid", "p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text" DEFAULT NULL::"text", "p_gender" "text" DEFAULT NULL::"text", "p_date_of_birth" "date" DEFAULT NULL::"date", "p_parent_name" "text" DEFAULT NULL::"text", "p_parent_phone" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_full_name), '') = '' then raise exception 'Student name is required'; end if;

  update public.students st
     set st.full_name = trim(p_full_name),
         st.class_id = p_class_id,
         st.admission_number = nullif(trim(p_admission_number), ''),
         st.gender = nullif(trim(p_gender), ''),
         st.date_of_birth = p_date_of_birth,
         st.parent_name = nullif(trim(p_parent_name), ''),
         st.parent_phone = nullif(trim(p_parent_phone), ''),
         st.address = nullif(trim(p_address), '')
   where st.id = p_student_id;

  perform public.log_activity('student_updated', 'student', p_student_id, trim(p_full_name));
end;
$$;


ALTER FUNCTION "public"."admin_update_student"("p_student_id" "uuid", "p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_subject"("p_subject_id" "uuid", "p_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Subject name is required'; end if;

  update public.subjects s
     set s.name = trim(p_name)
   where s.id = p_subject_id;

  perform public.log_activity('subject_updated', 'subject', p_subject_id, trim(p_name));
end;
$$;


ALTER FUNCTION "public"."admin_update_subject"("p_subject_id" "uuid", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_term_open"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if exists (
    select 1
    from public.terms t
    where t.name = new.term
      and t.is_open = false
  ) then
    raise exception 'This term is closed for score entry';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."check_term_open"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_term_name"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select t.name
    from public.terms t
   where t.is_current = true
   limit 1;
$$;


ALTER FUNCTION "public"."current_term_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"("p_action" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
begin
  select pr.full_name
    into v_actor_name
    from public.profiles pr
   where pr.id = auth.uid();

  insert into public.activity_log (
    actor_id, actor_name, action, entity_type, entity_id, entity_label, metadata
  )
  values (
    auth.uid(), v_actor_name, p_action, p_entity_type, p_entity_id, p_entity_label, p_metadata
  );
end;
$$;


ALTER FUNCTION "public"."log_activity"("p_action" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_scores_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_count int;
  v_teacher_name text;
begin
  select count(*) into v_count from new_rows nr;

  select pr.full_name into v_teacher_name
    from new_rows nr
    join public.teacher_assignments ta on ta.id = nr.teacher_assignment_id
    join public.profiles pr on pr.id = ta.teacher_id
   limit 1;

  perform public.log_activity(
    'scores_saved',
    'scores',
    null,
    coalesce(v_teacher_name, 'A teacher'),
    jsonb_build_object('count', v_count)
  );

  return null;
end;
$$;


ALTER FUNCTION "public"."log_scores_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."scores_set_teacher_assignment_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_academic_year_id uuid;
  v_teacher_assignment_id uuid;
BEGIN
  -- Only attempt auto-link if teacher_assignment_id is missing/null
  IF NEW.teacher_assignment_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Need subject + student to compute correct teacher assignment
  IF NEW.subject_id IS NULL OR NEW.student_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Use current academic year (Option A)
  SELECT id INTO v_academic_year_id
  FROM public.academic_years
  WHERE current = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_academic_year_id IS NULL THEN
    -- No current academic year configured
    RETURN NEW;
  END IF;

  -- Find the teacher assignment for this class+subject+current academic year
  SELECT ta.id INTO v_teacher_assignment_id
  FROM public.teacher_assignments ta
  JOIN public.students s ON s.class_id = ta.class_id
  WHERE s.id = NEW.student_id
    AND ta.subject_id = NEW.subject_id
    AND ta.academic_year_id = v_academic_year_id
  ORDER BY ta.created_at DESC
  LIMIT 1;

  IF v_teacher_assignment_id IS NOT NULL THEN
    NEW.teacher_assignment_id := v_teacher_assignment_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."scores_set_teacher_assignment_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."teacher_completion_ranking"() RETURNS TABLE("teacher_id" "uuid", "teacher_name" "text", "scores_entered" bigint, "total_students" bigint, "completion_percentage" numeric, "teacher_rank" bigint, "teacher_position" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
with score_fields_cfg as (
  select count(*)::bigint as total_student_fields
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'scores'
    and column_name in ('classwork','groupwork','projectwork','test','exam_score')
),
teacher_totals as (
  select
    tw.teacher_id,
    sum(tw.scores_entered) as scores_entered,
    sum(tw.total_students) as total_students,
    case
      when sum(tw.total_students) = 0 then 0
      else round(
        (
          sum(tw.scores_entered)::numeric
          / (sum(tw.total_students)::numeric * cfg.total_student_fields)
        ) * 100,
        2
      )
    end as completion_percentage
  from public.teacher_workload_view tw
  cross join score_fields_cfg cfg
  group by tw.teacher_id, cfg.total_student_fields
),
teachers as (
  select p.id as teacher_id, p.full_name as teacher_name
  from public.profiles p
  where p.role = 'teacher'
),
ranked as (
  select
    t.teacher_id,
    t.teacher_name,
    coalesce(tt.scores_entered, 0) as scores_entered,
    coalesce(tt.total_students, 0) as total_students,
    coalesce(tt.completion_percentage, 0) as completion_percentage,
    dense_rank() over (
      order by coalesce(tt.completion_percentage, 0) desc
    ) as teacher_rank
  from teachers t
  left join teacher_totals tt
    on tt.teacher_id = t.teacher_id
)
select
  r.teacher_id,
  r.teacher_name,
  r.scores_entered,
  r.total_students,
  r.completion_percentage,
  r.teacher_rank,
  case
    when r.teacher_rank % 100 in (11, 12, 13) then concat(r.teacher_rank::text, 'th')
    when r.teacher_rank % 10 = 1 then concat(r.teacher_rank::text, 'st')
    when r.teacher_rank % 10 = 2 then concat(r.teacher_rank::text, 'nd')
    when r.teacher_rank % 10 = 3 then concat(r.teacher_rank::text, 'rd')
    else concat(r.teacher_rank::text, 'th')
  end as teacher_position
from ranked r
order by r.teacher_rank, r.teacher_name;
$$;


ALTER FUNCTION "public"."teacher_completion_ranking"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_score_student_class"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if not exists (
    select 1
    from teacher_assignments ta
    join students st on st.id = new.student_id
    where ta.id = new.teacher_assignment_id
      and st.class_id = ta.class_id
  ) then
    raise exception 'Student does not belong to assignment class';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."validate_score_student_class"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."academic_years" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "current" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."academic_years" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "actor_name" "text",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "entity_label" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "class_teacher_id" "uuid"
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_assignment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "term" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "classwork" numeric,
    "groupwork" numeric,
    "projectwork" numeric,
    "test" numeric,
    "exam_score" numeric
);


ALTER TABLE "public"."scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "class_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "academic_year_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teacher_assignments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."class_results_view" WITH ("security_invoker"='on') AS
 WITH "scored" AS (
         SELECT "ta"."id" AS "teacher_assignment_id",
            "ta"."teacher_id",
            "ta"."class_id",
            "c"."name" AS "class_name",
            "ta"."subject_id",
            "s"."name" AS "subject_name",
            "ta"."academic_year_id",
            "ay"."name" AS "academic_year",
            "sc"."term",
            "sc"."student_id",
            "st"."full_name" AS "student_name",
            ((((COALESCE("sc"."classwork", (0)::numeric) + COALESCE("sc"."groupwork", (0)::numeric)) + COALESCE("sc"."projectwork", (0)::numeric)) + COALESCE("sc"."test", (0)::numeric)) + COALESCE("sc"."exam_score", (0)::numeric)) AS "total_score",
            (((((COALESCE("sc"."classwork", (0)::numeric) + COALESCE("sc"."groupwork", (0)::numeric)) + COALESCE("sc"."projectwork", (0)::numeric)) + COALESCE("sc"."test", (0)::numeric)) + COALESCE("sc"."exam_score", (0)::numeric)) / 5.0) AS "average_score"
           FROM ((((("public"."teacher_assignments" "ta"
             JOIN "public"."classes" "c" ON (("c"."id" = "ta"."class_id")))
             JOIN "public"."subjects" "s" ON (("s"."id" = "ta"."subject_id")))
             JOIN "public"."academic_years" "ay" ON (("ay"."id" = "ta"."academic_year_id")))
             JOIN "public"."scores" "sc" ON (("sc"."teacher_assignment_id" = "ta"."id")))
             JOIN "public"."students" "st" ON (("st"."id" = "sc"."student_id")))
        )
 SELECT "teacher_assignment_id",
    "teacher_id",
    "class_id",
    "class_name",
    "subject_id",
    "subject_name",
    "academic_year_id",
    "academic_year",
    "term",
    "student_id",
    "student_name",
    "total_score",
    "average_score",
    "dense_rank"() OVER (PARTITION BY "teacher_assignment_id" ORDER BY "average_score" DESC) AS "position"
   FROM "scored";


ALTER VIEW "public"."class_results_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" "text" DEFAULT ''::"text" NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "role" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gender" "text" DEFAULT ''::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."overall_class_student_ranking_view" WITH ("security_invoker"='on') AS
 WITH "per_subject" AS (
         SELECT "ta"."class_id",
            "ta"."academic_year_id",
            "s"."term",
            "s"."student_id",
            "p"."full_name" AS "student_name",
            "s"."teacher_assignment_id",
            "ta"."subject_id",
            ((((("s"."classwork" + "s"."groupwork") + "s"."projectwork") + "s"."test") / 2.0) + ("s"."exam_score" / 2.0)) AS "subject_grand_total"
           FROM (("public"."scores" "s"
             JOIN "public"."teacher_assignments" "ta" ON (("ta"."id" = "s"."teacher_assignment_id")))
             JOIN "public"."profiles" "p" ON (("p"."id" = "s"."student_id")))
        ), "aggregated" AS (
         SELECT "per_subject"."class_id",
            "per_subject"."academic_year_id",
            "per_subject"."term",
            "per_subject"."student_id",
            "per_subject"."student_name",
            "avg"("per_subject"."subject_grand_total") AS "overall_average_score"
           FROM "per_subject"
          GROUP BY "per_subject"."class_id", "per_subject"."academic_year_id", "per_subject"."term", "per_subject"."student_id", "per_subject"."student_name"
        ), "ranked" AS (
         SELECT "aggregated"."class_id",
            "aggregated"."academic_year_id",
            "aggregated"."term",
            "aggregated"."student_id",
            "aggregated"."student_name",
            "aggregated"."overall_average_score",
            "dense_rank"() OVER (PARTITION BY "aggregated"."class_id", "aggregated"."academic_year_id", "aggregated"."term" ORDER BY "aggregated"."overall_average_score" DESC) AS "overall_position"
           FROM "aggregated"
        )
 SELECT "class_id",
    ( SELECT "c"."name"
           FROM "public"."classes" "c"
          WHERE ("c"."id" = "r"."class_id")) AS "class_name",
    "academic_year_id",
    ( SELECT "ay"."name"
           FROM "public"."academic_years" "ay"
          WHERE ("ay"."id" = "r"."academic_year_id")) AS "academic_year",
    "term",
    "student_id",
    "student_name",
    "overall_average_score",
    "overall_position"
   FROM "ranked" "r";


ALTER VIEW "public"."overall_class_student_ranking_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."student_result_view" WITH ("security_invoker"='on') AS
 WITH "computed" AS (
         SELECT "s"."id",
            "s"."student_id",
            "s"."teacher_assignment_id",
            "s"."term",
            "s"."created_at",
            "s"."classwork",
            "s"."groupwork",
            "s"."projectwork",
            "s"."test",
            "s"."exam_score",
            ((("s"."classwork" + "s"."groupwork") + "s"."projectwork") + "s"."test") AS "ca_total",
            (((("s"."classwork" + "s"."groupwork") + "s"."projectwork") + "s"."test") / 2.0) AS "ca_50",
            ("s"."exam_score" / 2.0) AS "exam_50",
            ((((("s"."classwork" + "s"."groupwork") + "s"."projectwork") + "s"."test") / 2.0) + ("s"."exam_score" / 2.0)) AS "grand_total"
           FROM "public"."scores" "s"
        )
 SELECT "c"."id" AS "score_id",
    "c"."student_id",
    "p"."full_name" AS "student_name",
    "ta"."id" AS "teacher_assignment_id",
    "ta"."class_id",
    "ta"."subject_id",
    "ta"."academic_year_id",
    "cl"."name" AS "class_name",
    "sub"."name" AS "subject_name",
    "ay"."name" AS "academic_year",
    "c"."term",
    "c"."classwork",
    "c"."groupwork",
    "c"."projectwork",
    "c"."test",
    "c"."exam_score",
    "c"."ca_total",
    "c"."ca_50",
    "c"."exam_50",
    "c"."grand_total",
        CASE
            WHEN ("c"."grand_total" >= (80)::numeric) THEN '1'::"text"
            WHEN ("c"."grand_total" >= (75)::numeric) THEN '2'::"text"
            WHEN ("c"."grand_total" >= (70)::numeric) THEN '3'::"text"
            WHEN ("c"."grand_total" >= (60)::numeric) THEN '4'::"text"
            WHEN ("c"."grand_total" >= (55)::numeric) THEN '5'::"text"
            WHEN ("c"."grand_total" >= (50)::numeric) THEN '6'::"text"
            WHEN ("c"."grand_total" >= (40)::numeric) THEN '7'::"text"
            WHEN ("c"."grand_total" >= (35)::numeric) THEN '8'::"text"
            ELSE '9'::"text"
        END AS "grade",
        CASE
            WHEN ("c"."grand_total" >= (80)::numeric) THEN 'Highest'::"text"
            WHEN ("c"."grand_total" >= (75)::numeric) THEN 'Higher'::"text"
            WHEN ("c"."grand_total" >= (70)::numeric) THEN 'High'::"text"
            WHEN ("c"."grand_total" >= (60)::numeric) THEN 'High Average'::"text"
            WHEN ("c"."grand_total" >= (55)::numeric) THEN 'Average'::"text"
            WHEN ("c"."grand_total" >= (50)::numeric) THEN 'Low Average'::"text"
            WHEN ("c"."grand_total" >= (40)::numeric) THEN 'Low'::"text"
            WHEN ("c"."grand_total" >= (35)::numeric) THEN 'Lower'::"text"
            ELSE 'Lowest'::"text"
        END AS "remarks"
   FROM ((((("computed" "c"
     JOIN "public"."profiles" "p" ON (("p"."id" = "c"."student_id")))
     JOIN "public"."teacher_assignments" "ta" ON (("ta"."id" = "c"."teacher_assignment_id")))
     JOIN "public"."classes" "cl" ON (("cl"."id" = "ta"."class_id")))
     JOIN "public"."subjects" "sub" ON (("sub"."id" = "ta"."subject_id")))
     JOIN "public"."academic_years" "ay" ON (("ay"."id" = "ta"."academic_year_id")));


ALTER VIEW "public"."student_result_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_performance_view" WITH ("security_invoker"='on') AS
 WITH "base" AS (
         SELECT "sr"."teacher_assignment_id",
            "ta"."teacher_id",
            "sr"."grand_total"
           FROM ("public"."student_result_view" "sr"
             JOIN "public"."teacher_assignments" "ta" ON (("ta"."id" = "sr"."teacher_assignment_id")))
        ), "aggregated" AS (
         SELECT "base"."teacher_id",
            "count"(*) AS "total_students",
            "avg"("base"."grand_total") AS "average_score",
            "max"("base"."grand_total") AS "highest_score",
            "min"("base"."grand_total") AS "lowest_score"
           FROM "base"
          GROUP BY "base"."teacher_id"
        ), "ranked" AS (
         SELECT "a"."teacher_id",
            "a"."total_students",
            "a"."average_score",
            "a"."highest_score",
            "a"."lowest_score",
            "dense_rank"() OVER (ORDER BY "a"."average_score" DESC) AS "teacher_rank"
           FROM "aggregated" "a"
        )
 SELECT "teacher_id",
    "total_students",
    "average_score",
    "highest_score",
    "lowest_score",
    "teacher_rank",
        CASE
            WHEN (("teacher_rank" % (100)::bigint) = ANY (ARRAY[(11)::bigint, (12)::bigint, (13)::bigint])) THEN "concat"(("teacher_rank")::"text", 'th')
            WHEN (("teacher_rank" % (10)::bigint) = 1) THEN "concat"(("teacher_rank")::"text", 'st')
            WHEN (("teacher_rank" % (10)::bigint) = 2) THEN "concat"(("teacher_rank")::"text", 'nd')
            WHEN (("teacher_rank" % (10)::bigint) = 3) THEN "concat"(("teacher_rank")::"text", 'rd')
            ELSE "concat"(("teacher_rank")::"text", 'th')
        END AS "teacher_position"
   FROM "ranked" "r";


ALTER VIEW "public"."teacher_performance_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."school_overview_view" WITH ("security_invoker"='on') AS
 WITH "stats" AS (
         SELECT ( SELECT "count"(*) AS "count"
                   FROM "public"."students") AS "total_students",
            ( SELECT "count"(*) AS "count"
                   FROM "public"."profiles"
                  WHERE ("profiles"."role" = 'teacher'::"text")) AS "total_teachers",
            ( SELECT "count"(*) AS "count"
                   FROM "public"."classes") AS "total_classes",
            ( SELECT "count"(*) AS "count"
                   FROM "public"."subjects") AS "total_subjects",
            ( SELECT "count"(*) AS "count"
                   FROM "public"."scores") AS "total_scores_entered",
            ( SELECT "avg"("student_result_view"."grand_total") AS "avg"
                   FROM "public"."student_result_view") AS "school_average"
        ), "pass_stats" AS (
         SELECT "count"(*) FILTER (WHERE ("student_result_view"."grand_total" >= (50)::numeric)) AS "passed",
            "count"(*) AS "total"
           FROM "public"."student_result_view"
        ), "top_student" AS (
         SELECT "student_result_view"."student_id",
            "student_result_view"."student_name",
            "student_result_view"."grand_total"
           FROM "public"."student_result_view"
          ORDER BY "student_result_view"."grand_total" DESC
         LIMIT 1
        ), "top_teacher" AS (
         SELECT "teacher_performance_view"."teacher_id",
            "teacher_performance_view"."average_score",
            "teacher_performance_view"."teacher_rank"
           FROM "public"."teacher_performance_view"
          ORDER BY "teacher_performance_view"."average_score" DESC
         LIMIT 1
        )
 SELECT "s"."total_students",
    "s"."total_teachers",
    "s"."total_classes",
    "s"."total_subjects",
    "s"."total_scores_entered",
    "s"."school_average",
    "ps"."passed",
    "ps"."total",
        CASE
            WHEN ("ps"."total" = 0) THEN (0)::double precision
            ELSE ((("ps"."passed")::double precision / ("ps"."total")::double precision) * (100)::double precision)
        END AS "pass_rate_percentage",
    "ts"."student_id" AS "top_student_id",
    "ts"."student_name" AS "top_student_name",
    "ts"."grand_total" AS "top_student_score",
    "tt"."teacher_id" AS "top_teacher_id",
    "tt"."average_score" AS "top_teacher_score",
    "tt"."teacher_rank" AS "top_teacher_rank"
   FROM ((("stats" "s"
     CROSS JOIN "pass_stats" "ps")
     CROSS JOIN "top_student" "ts")
     CROSS JOIN "top_teacher" "tt");


ALTER VIEW "public"."school_overview_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_assignment_rankings_view" WITH ("security_invoker"='true') AS
 WITH "ranked" AS (
         SELECT "ta"."id" AS "teacher_assignment_id",
            "ta"."teacher_id",
            "ta"."class_id",
            "c"."name" AS "class_name",
            "ta"."subject_id",
            "s"."name" AS "subject_name",
            "ta"."academic_year_id",
            "ay"."name" AS "academic_year",
            "sc"."term",
            "sc"."student_id",
            "st"."full_name" AS "student_name",
            ((((COALESCE("sc"."classwork", (0)::numeric) + COALESCE("sc"."groupwork", (0)::numeric)) + COALESCE("sc"."projectwork", (0)::numeric)) + COALESCE("sc"."test", (0)::numeric)) + COALESCE("sc"."exam_score", (0)::numeric)) AS "total_score",
            ((((((COALESCE("sc"."classwork", (0)::numeric) + COALESCE("sc"."groupwork", (0)::numeric)) + COALESCE("sc"."projectwork", (0)::numeric)) + COALESCE("sc"."test", (0)::numeric)) + COALESCE("sc"."exam_score", (0)::numeric)) / 200.0) * 100.0) AS "percentage_score",
            "dense_rank"() OVER (PARTITION BY "ta"."id" ORDER BY ((((COALESCE("sc"."classwork", (0)::numeric) + COALESCE("sc"."groupwork", (0)::numeric)) + COALESCE("sc"."projectwork", (0)::numeric)) + COALESCE("sc"."test", (0)::numeric)) + COALESCE("sc"."exam_score", (0)::numeric)) DESC) AS "position"
           FROM ((((("public"."teacher_assignments" "ta"
             JOIN "public"."classes" "c" ON (("c"."id" = "ta"."class_id")))
             JOIN "public"."subjects" "s" ON (("s"."id" = "ta"."subject_id")))
             JOIN "public"."academic_years" "ay" ON (("ay"."id" = "ta"."academic_year_id")))
             JOIN "public"."scores" "sc" ON (("sc"."teacher_assignment_id" = "ta"."id")))
             JOIN "public"."students" "st" ON (("st"."id" = "sc"."student_id")))
        )
 SELECT "teacher_assignment_id",
    "teacher_id",
    "class_id",
    "class_name",
    "subject_id",
    "subject_name",
    "academic_year_id",
    "academic_year",
    "term",
    "student_id",
    "student_name",
    "total_score",
    "percentage_score",
    "position"
   FROM "ranked";


ALTER VIEW "public"."teacher_assignment_rankings_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_assignment_students_view" WITH ("security_invoker"='on') AS
 SELECT "ta"."id" AS "teacher_assignment_id",
    "ta"."teacher_id",
    "ta"."class_id",
    "ta"."academic_year_id",
    "st"."id" AS "student_id",
    "st"."full_name" AS "student_name",
    "sc"."id" AS "score_id",
    "sc"."term",
    "sc"."classwork",
    "sc"."groupwork",
    "sc"."projectwork",
    "sc"."test",
    "sc"."exam_score"
   FROM (("public"."teacher_assignments" "ta"
     JOIN "public"."students" "st" ON (("st"."class_id" = "ta"."class_id")))
     LEFT JOIN "public"."scores" "sc" ON ((("sc"."teacher_assignment_id" = "ta"."id") AND ("sc"."student_id" = "st"."id"))))
  WHERE ("st"."active" IS DISTINCT FROM false);


ALTER VIEW "public"."teacher_assignment_students_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_dashboard_view" WITH ("security_invoker"='on') AS
 SELECT "ta"."id" AS "assignment_id",
    "ta"."teacher_id",
    "p"."full_name" AS "teacher_name",
    "ta"."class_id",
    "ta"."subject_id",
    "ta"."academic_year_id",
    "c"."name" AS "class_name",
    "s"."name" AS "subject_name",
    "ay"."name" AS "academic_year",
    ( SELECT "sc"."term"
           FROM "public"."scores" "sc"
          WHERE ("sc"."teacher_assignment_id" = "ta"."id")
          ORDER BY "sc"."created_at" DESC
         LIMIT 1) AS "term"
   FROM (((("public"."teacher_assignments" "ta"
     JOIN "public"."profiles" "p" ON (("p"."id" = "ta"."teacher_id")))
     JOIN "public"."classes" "c" ON (("c"."id" = "ta"."class_id")))
     JOIN "public"."subjects" "s" ON (("s"."id" = "ta"."subject_id")))
     JOIN "public"."academic_years" "ay" ON (("ay"."id" = "ta"."academic_year_id")))
  ORDER BY "ta"."created_at" DESC;


ALTER VIEW "public"."teacher_dashboard_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_performance_dashboard_view" WITH ("security_invoker"='on') AS
 WITH "teachers" AS (
         SELECT "p"."id" AS "teacher_id",
            "p"."full_name" AS "teacher_name"
           FROM "public"."profiles" "p"
          WHERE ("p"."role" = 'teacher'::"text")
        ), "teacher_scores" AS (
         SELECT "ta"."teacher_id",
            "sr"."grand_total"
           FROM ("public"."teacher_assignments" "ta"
             LEFT JOIN "public"."student_result_view" "sr" ON (("sr"."teacher_assignment_id" = "ta"."id")))
        ), "aggregated" AS (
         SELECT "t"."teacher_id",
            "t"."teacher_name",
            "count"("ts"."grand_total") AS "total_scores",
            COALESCE("round"("avg"("ts"."grand_total"), 2), (0)::numeric) AS "average_score",
            COALESCE("max"("ts"."grand_total"), (0)::numeric) AS "highest_score",
            COALESCE("min"("ts"."grand_total"), (0)::numeric) AS "lowest_score"
           FROM ("teachers" "t"
             LEFT JOIN "teacher_scores" "ts" ON (("ts"."teacher_id" = "t"."teacher_id")))
          GROUP BY "t"."teacher_id", "t"."teacher_name"
        ), "ranked" AS (
         SELECT "a"."teacher_id",
            "a"."teacher_name",
            "a"."total_scores",
            "a"."average_score",
            "a"."highest_score",
            "a"."lowest_score",
            "dense_rank"() OVER (ORDER BY "a"."average_score" DESC) AS "teacher_rank"
           FROM "aggregated" "a"
        )
 SELECT "teacher_id",
    "teacher_name",
    "total_scores",
    "average_score",
    "highest_score",
    "lowest_score",
    "teacher_rank",
        CASE
            WHEN (("teacher_rank" % (100)::bigint) = ANY (ARRAY[(11)::bigint, (12)::bigint, (13)::bigint])) THEN "concat"("teacher_rank", 'th')
            WHEN (("teacher_rank" % (10)::bigint) = 1) THEN "concat"("teacher_rank", 'st')
            WHEN (("teacher_rank" % (10)::bigint) = 2) THEN "concat"("teacher_rank", 'nd')
            WHEN (("teacher_rank" % (10)::bigint) = 3) THEN "concat"("teacher_rank", 'rd')
            ELSE "concat"("teacher_rank", 'th')
        END AS "teacher_position"
   FROM "ranked" "r"
  ORDER BY "teacher_rank", "teacher_name";


ALTER VIEW "public"."teacher_performance_dashboard_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_workload_dashboard_view" WITH ("security_invoker"='on') AS
 WITH "base" AS (
         SELECT "ta"."id" AS "assignment_id",
            "ta"."teacher_id",
            "ta"."class_id",
            "ta"."subject_id",
            "ta"."academic_year_id",
            "t"."full_name" AS "teacher_name",
            "s"."name" AS "subject_name",
            "c"."name" AS "class_name",
            "ay"."name" AS "academic_year_name"
           FROM (((("public"."teacher_assignments" "ta"
             JOIN "public"."profiles" "t" ON (("t"."id" = "ta"."teacher_id")))
             JOIN "public"."subjects" "s" ON (("s"."id" = "ta"."subject_id")))
             JOIN "public"."classes" "c" ON (("c"."id" = "ta"."class_id")))
             JOIN "public"."academic_years" "ay" ON (("ay"."id" = "ta"."academic_year_id")))
        ), "class_students" AS (
         SELECT "b_1"."assignment_id",
            "st"."id" AS "student_id"
           FROM ("base" "b_1"
             JOIN "public"."students" "st" ON (("st"."class_id" = "b_1"."class_id")))
          WHERE ("st"."active" IS DISTINCT FROM false)
        ), "student_scores" AS (
         SELECT "cs"."assignment_id",
            "cs"."student_id",
            "sc"."classwork",
            "sc"."groupwork",
            "sc"."projectwork",
            "sc"."test",
            "sc"."exam_score"
           FROM ("class_students" "cs"
             LEFT JOIN "public"."scores" "sc" ON ((("sc"."teacher_assignment_id" = "cs"."assignment_id") AND ("sc"."student_id" = "cs"."student_id"))))
        ), "agg" AS (
         SELECT "student_scores"."assignment_id",
            "count"(*) AS "total_students",
            "count"(*) FILTER (WHERE ("student_scores"."classwork" IS NOT NULL)) AS "classwork_completed",
            "count"(*) FILTER (WHERE ("student_scores"."groupwork" IS NOT NULL)) AS "groupwork_completed",
            "count"(*) FILTER (WHERE ("student_scores"."projectwork" IS NOT NULL)) AS "projectwork_completed",
            "count"(*) FILTER (WHERE ("student_scores"."test" IS NOT NULL)) AS "test_completed",
            "count"(*) FILTER (WHERE ("student_scores"."exam_score" IS NOT NULL)) AS "exam_score_completed",
            (((("count"(*) FILTER (WHERE ("student_scores"."classwork" IS NOT NULL)) + "count"(*) FILTER (WHERE ("student_scores"."groupwork" IS NOT NULL))) + "count"(*) FILTER (WHERE ("student_scores"."projectwork" IS NOT NULL))) + "count"(*) FILTER (WHERE ("student_scores"."test" IS NOT NULL))) + "count"(*) FILTER (WHERE ("student_scores"."exam_score" IS NOT NULL))) AS "total_fields_completed",
            ("count"(*) * 5) AS "total_fields_possible"
           FROM "student_scores"
          GROUP BY "student_scores"."assignment_id"
        )
 SELECT "b"."teacher_id",
    "b"."teacher_name",
    "b"."assignment_id",
    "b"."subject_name",
    "b"."class_name",
    "b"."academic_year_name",
    COALESCE("a"."total_students", (0)::bigint) AS "total_students",
    COALESCE("a"."classwork_completed", (0)::bigint) AS "classwork_completed",
    COALESCE("a"."groupwork_completed", (0)::bigint) AS "groupwork_completed",
    COALESCE("a"."projectwork_completed", (0)::bigint) AS "projectwork_completed",
    COALESCE("a"."test_completed", (0)::bigint) AS "test_completed",
    COALESCE("a"."exam_score_completed", (0)::bigint) AS "exam_score_completed",
    "round"(((100.0 * (COALESCE("a"."classwork_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_students", 0))::numeric), 1) AS "classwork_completion_percentage",
    "round"(((100.0 * (COALESCE("a"."groupwork_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_students", 0))::numeric), 1) AS "groupwork_completion_percentage",
    "round"(((100.0 * (COALESCE("a"."projectwork_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_students", 0))::numeric), 1) AS "projectwork_completion_percentage",
    "round"(((100.0 * (COALESCE("a"."test_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_students", 0))::numeric), 1) AS "test_completion_percentage",
    "round"(((100.0 * (COALESCE("a"."exam_score_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_students", 0))::numeric), 1) AS "exam_score_completion_percentage",
    "round"(((100.0 * (COALESCE("a"."total_fields_completed", (0)::bigint))::numeric) / (NULLIF("a"."total_fields_possible", 0))::numeric), 1) AS "grand_total_completion_percentage"
   FROM ("base" "b"
     LEFT JOIN "agg" "a" ON (("a"."assignment_id" = "b"."assignment_id")));


ALTER VIEW "public"."teacher_workload_dashboard_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."teacher_workload_view" WITH ("security_invoker"='on') AS
 WITH "base" AS (
         SELECT "ta"."teacher_id",
            "ta"."id" AS "assignment_id",
            "ta"."class_id",
            "ta"."subject_id",
            "ta"."academic_year_id"
           FROM "public"."teacher_assignments" "ta"
        ), "score_stats" AS (
         SELECT "s"."teacher_assignment_id",
            "count"(*) FILTER (WHERE ("s"."classwork" IS NOT NULL)) AS "classwork_filled",
            "count"(*) FILTER (WHERE ("s"."groupwork" IS NOT NULL)) AS "groupwork_filled",
            "count"(*) FILTER (WHERE ("s"."projectwork" IS NOT NULL)) AS "projectwork_filled",
            "count"(*) FILTER (WHERE ("s"."test" IS NOT NULL)) AS "test_filled",
            "count"(*) FILTER (WHERE ("s"."exam_score" IS NOT NULL)) AS "exam_score_filled"
           FROM "public"."scores" "s"
          GROUP BY "s"."teacher_assignment_id"
        ), "class_sizes" AS (
         SELECT "st"."class_id",
            "count"(*) AS "total_students"
           FROM "public"."students" "st"
          GROUP BY "st"."class_id"
        ), "score_rollup" AS (
         SELECT "ss"."teacher_assignment_id",
            ((((COALESCE("ss"."classwork_filled", (0)::bigint) + COALESCE("ss"."groupwork_filled", (0)::bigint)) + COALESCE("ss"."projectwork_filled", (0)::bigint)) + COALESCE("ss"."test_filled", (0)::bigint)) + COALESCE("ss"."exam_score_filled", (0)::bigint)) AS "scores_entered"
           FROM "score_stats" "ss"
        )
 SELECT "b"."teacher_id",
    "b"."assignment_id",
    "b"."class_id",
    "b"."subject_id",
    "b"."academic_year_id",
    COALESCE("sr"."scores_entered", (0)::bigint) AS "scores_entered",
    COALESCE("cs"."total_students", (0)::bigint) AS "total_students",
        CASE
            WHEN (COALESCE("cs"."total_students", (0)::bigint) = 0) THEN (0)::numeric
            ELSE "round"((((COALESCE("sr"."scores_entered", (0)::bigint))::numeric / (("cs"."total_students")::numeric * (5)::numeric)) * (100)::numeric), 2)
        END AS "completion_percentage"
   FROM (("base" "b"
     LEFT JOIN "score_rollup" "sr" ON (("sr"."teacher_assignment_id" = "b"."assignment_id")))
     LEFT JOIN "class_sizes" "cs" ON (("cs"."class_id" = "b"."class_id")));


ALTER VIEW "public"."teacher_workload_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_current" boolean DEFAULT false NOT NULL,
    "is_open" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."terms" OWNER TO "postgres";


ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_assignment_student_term_unique" UNIQUE ("teacher_assignment_id", "student_id", "term");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_assignment_student_unique" UNIQUE ("teacher_assignment_id", "student_id");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terms"
    ADD CONSTRAINT "terms_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "academic_years_single_current" ON "public"."academic_years" USING "btree" ("current") WHERE ("current" = true);



CREATE INDEX "idx_scores_student_id" ON "public"."scores" USING "btree" ("student_id");



CREATE INDEX "idx_scores_teacher_assignment_id" ON "public"."scores" USING "btree" ("teacher_assignment_id");



CREATE INDEX "idx_students_class_id" ON "public"."students" USING "btree" ("class_id");



CREATE INDEX "idx_teacher_assignments_class_id" ON "public"."teacher_assignments" USING "btree" ("class_id");



CREATE INDEX "idx_teacher_assignments_teacher_id" ON "public"."teacher_assignments" USING "btree" ("teacher_id");



CREATE INDEX "teacher_assignments_lookup_idx" ON "public"."teacher_assignments" USING "btree" ("class_id", "subject_id", "academic_year_id");



CREATE UNIQUE INDEX "teacher_assignments_unique_combo" ON "public"."teacher_assignments" USING "btree" ("teacher_id", "subject_id", "class_id", "academic_year_id");



CREATE UNIQUE INDEX "terms_single_current" ON "public"."terms" USING "btree" ("is_current") WHERE ("is_current" = true);



CREATE OR REPLACE TRIGGER "scores_activity_log_insert" AFTER INSERT ON "public"."scores" REFERENCING NEW TABLE AS "new_rows" FOR EACH STATEMENT EXECUTE FUNCTION "public"."log_scores_activity"();



CREATE OR REPLACE TRIGGER "scores_activity_log_update" AFTER UPDATE ON "public"."scores" REFERENCING NEW TABLE AS "new_rows" FOR EACH STATEMENT EXECUTE FUNCTION "public"."log_scores_activity"();



CREATE OR REPLACE TRIGGER "scores_term_open_check" BEFORE INSERT OR UPDATE ON "public"."scores" FOR EACH ROW EXECUTE FUNCTION "public"."check_term_open"();



CREATE OR REPLACE TRIGGER "trg_scores_set_teacher_assignment_id" BEFORE INSERT ON "public"."scores" FOR EACH ROW EXECUTE FUNCTION "public"."scores_set_teacher_assignment_id"();



CREATE OR REPLACE TRIGGER "trg_validate_score" BEFORE INSERT OR UPDATE ON "public"."scores" FOR EACH ROW EXECUTE FUNCTION "public"."validate_score_student_class"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_student_id_fkey1" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id");



ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "public"."teacher_assignments"("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id");



ALTER TABLE ONLY "public"."teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id");



ALTER TABLE ONLY "public"."teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."teacher_assignments"
    ADD CONSTRAINT "teacher_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Read own scores" ON "public"."scores" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Students can view their own scores" ON "public"."scores" FOR SELECT TO "authenticated" USING (("student_id" = "auth"."uid"()));



CREATE POLICY "Teachers can insert scores" ON "public"."scores" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can insert their own scores" ON "public"."scores" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can view their own scores" ON "public"."scores" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Update scores" ON "public"."scores" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."id" = "scores"."teacher_assignment_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."academic_years" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin can insert academic_years" ON "public"."academic_years" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin can insert terms" ON "public"."terms" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin can read activity log" ON "public"."activity_log" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "admin can update academic_years" ON "public"."academic_years" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "admin can update terms" ON "public"."terms" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "allow read classes" ON "public"."classes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated can read academic years" ON "public"."academic_years" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated can read subjects" ON "public"."subjects" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated can read terms" ON "public"."terms" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public read academic_years" ON "public"."academic_years" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read classes" ON "public"."classes" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read profiles" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read scores" ON "public"."scores" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read teacher_assignments" ON "public"."teacher_assignments" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public read terms" ON "public"."terms" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teacher_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teachers can read students in their classes" ON "public"."students" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."teacher_assignments" "ta"
  WHERE (("ta"."class_id" = "students"."class_id") AND ("ta"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "teachers can read their assignments" ON "public"."teacher_assignments" FOR SELECT TO "authenticated" USING (("teacher_id" = "auth"."uid"()));



ALTER TABLE "public"."terms" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "private"."teacher_completion_ranking"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid", "p_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid", "p_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_assignment_students"("p_assignment_id" "uuid", "p_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_bulk_import_assignments"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_assignments"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_assignments"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_bulk_import_classes"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_classes"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_classes"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_bulk_import_students"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_students"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_bulk_import_students"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_class_broadsheet"("p_class_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_class_broadsheet"("p_class_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_class_broadsheet"("p_class_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_class_students"("p_class_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_class_students"("p_class_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_class_students"("p_class_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_class_subjects"("p_class_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_class_subjects"("p_class_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_class_subjects"("p_class_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_class_summary"("p_class_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_class_summary"("p_class_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_class_summary"("p_class_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_classes_overview"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_classes_overview"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_classes_overview"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_classes_picker"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_classes_picker"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_classes_picker"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_completion_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_completion_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_completion_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_assignment"("p_teacher_id" "uuid", "p_subject_id" "uuid", "p_class_id" "uuid", "p_academic_year_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_assignment"("p_teacher_id" "uuid", "p_subject_id" "uuid", "p_class_id" "uuid", "p_academic_year_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_assignment"("p_teacher_id" "uuid", "p_subject_id" "uuid", "p_class_id" "uuid", "p_academic_year_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_class"("p_name" "text", "p_class_teacher_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_class"("p_name" "text", "p_class_teacher_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_class"("p_name" "text", "p_class_teacher_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_student"("p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_student"("p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_student"("p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_subject"("p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_subject"("p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_subject"("p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_dashboard_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_dashboard_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_dashboard_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_assignment"("p_assignment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_assignment"("p_assignment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_assignment"("p_assignment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_log_export"("p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_log_export"("p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_log_export"("p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_recent_activity"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_recent_activity"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_recent_activity"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_academic_year_archived"("p_id" "uuid", "p_archived" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_academic_year_archived"("p_id" "uuid", "p_archived" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_academic_year_archived"("p_id" "uuid", "p_archived" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_active_academic_year"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_active_academic_year"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_active_academic_year"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_active_term"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_active_term"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_active_term"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_student_active"("p_student_id" "uuid", "p_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_student_active"("p_student_id" "uuid", "p_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_student_active"("p_student_id" "uuid", "p_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_teacher_active"("p_teacher_id" "uuid", "p_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_teacher_active"("p_teacher_id" "uuid", "p_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_teacher_active"("p_teacher_id" "uuid", "p_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_set_term_open"("p_id" "uuid", "p_open" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_term_open"("p_id" "uuid", "p_open" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_term_open"("p_id" "uuid", "p_open" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_student_profile"("p_student_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_student_profile"("p_student_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_student_profile"("p_student_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_student_rankings"("p_class_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_student_rankings"("p_class_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_student_rankings"("p_class_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid", "p_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid", "p_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_student_subject_scores"("p_student_id" "uuid", "p_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_subject_performance"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_subject_performance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_subject_performance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_subjects_picker"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_subjects_picker"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_subjects_picker"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_teacher_assignments"("p_teacher_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_teacher_assignments"("p_teacher_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_teacher_assignments"("p_teacher_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_teacher_summary"("p_teacher_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_teacher_summary"("p_teacher_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_teacher_summary"("p_teacher_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_teachers_overview"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_teachers_overview"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_teachers_overview"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_teachers_picker"() TO "anon";
GRANT ALL ON FUNCTION "public"."admin_teachers_picker"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_teachers_picker"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_class"("p_class_id" "uuid", "p_name" "text", "p_class_teacher_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_class"("p_class_id" "uuid", "p_name" "text", "p_class_teacher_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_class"("p_class_id" "uuid", "p_name" "text", "p_class_teacher_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_student"("p_student_id" "uuid", "p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_student"("p_student_id" "uuid", "p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_student"("p_student_id" "uuid", "p_full_name" "text", "p_class_id" "uuid", "p_admission_number" "text", "p_gender" "text", "p_date_of_birth" "date", "p_parent_name" "text", "p_parent_phone" "text", "p_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_subject"("p_subject_id" "uuid", "p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_subject"("p_subject_id" "uuid", "p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_subject"("p_subject_id" "uuid", "p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_term_open"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_term_open"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_term_open"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_term_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_term_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_term_name"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_action" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_action" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_action" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_label" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_scores_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_scores_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_scores_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."scores_set_teacher_assignment_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."scores_set_teacher_assignment_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."scores_set_teacher_assignment_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."teacher_completion_ranking"() TO "service_role";
GRANT ALL ON FUNCTION "public"."teacher_completion_ranking"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."validate_score_student_class"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_score_student_class"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_score_student_class"() TO "service_role";
























GRANT ALL ON TABLE "public"."academic_years" TO "anon";
GRANT ALL ON TABLE "public"."academic_years" TO "authenticated";
GRANT ALL ON TABLE "public"."academic_years" TO "service_role";



GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."scores" TO "anon";
GRANT ALL ON TABLE "public"."scores" TO "authenticated";
GRANT ALL ON TABLE "public"."scores" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_assignments" TO "anon";
GRANT ALL ON TABLE "public"."teacher_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."class_results_view" TO "anon";
GRANT ALL ON TABLE "public"."class_results_view" TO "authenticated";
GRANT ALL ON TABLE "public"."class_results_view" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."overall_class_student_ranking_view" TO "anon";
GRANT ALL ON TABLE "public"."overall_class_student_ranking_view" TO "authenticated";
GRANT ALL ON TABLE "public"."overall_class_student_ranking_view" TO "service_role";



GRANT ALL ON TABLE "public"."student_result_view" TO "anon";
GRANT ALL ON TABLE "public"."student_result_view" TO "authenticated";
GRANT ALL ON TABLE "public"."student_result_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_performance_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_performance_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_performance_view" TO "service_role";



GRANT ALL ON TABLE "public"."school_overview_view" TO "anon";
GRANT ALL ON TABLE "public"."school_overview_view" TO "authenticated";
GRANT ALL ON TABLE "public"."school_overview_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_assignment_rankings_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_assignment_rankings_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_assignment_rankings_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_assignment_students_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_assignment_students_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_assignment_students_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_dashboard_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_dashboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_dashboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_performance_dashboard_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_performance_dashboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_performance_dashboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_workload_dashboard_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_workload_dashboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_workload_dashboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_workload_view" TO "anon";
GRANT ALL ON TABLE "public"."teacher_workload_view" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_workload_view" TO "service_role";



GRANT ALL ON TABLE "public"."terms" TO "anon";
GRANT ALL ON TABLE "public"."terms" TO "authenticated";
GRANT ALL ON TABLE "public"."terms" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

drop trigger if exists "scores_activity_log_insert" on "public"."scores";

drop trigger if exists "scores_activity_log_update" on "public"."scores";

drop trigger if exists "scores_term_open_check" on "public"."scores";

drop trigger if exists "trg_scores_set_teacher_assignment_id" on "public"."scores";

drop trigger if exists "trg_validate_score" on "public"."scores";

drop policy "admin can insert academic_years" on "public"."academic_years";

drop policy "admin can update academic_years" on "public"."academic_years";

drop policy "public read academic_years" on "public"."academic_years";

drop policy "admin can read activity log" on "public"."activity_log";

drop policy "public read classes" on "public"."classes";

drop policy "public read profiles" on "public"."profiles";

drop policy "Read own scores" on "public"."scores";

drop policy "Teachers can insert scores" on "public"."scores";

drop policy "Teachers can insert their own scores" on "public"."scores";

drop policy "Teachers can view their own scores" on "public"."scores";

drop policy "Update scores" on "public"."scores";

drop policy "public read scores" on "public"."scores";

drop policy "teachers can read students in their classes" on "public"."students";

drop policy "public read teacher_assignments" on "public"."teacher_assignments";

drop policy "admin can insert terms" on "public"."terms";

drop policy "admin can update terms" on "public"."terms";

drop policy "public read terms" on "public"."terms";

alter table "public"."activity_log" drop constraint "activity_log_actor_id_fkey";

alter table "public"."classes" drop constraint "classes_class_teacher_id_fkey";

alter table "public"."scores" drop constraint "scores_student_id_fkey1";

alter table "public"."scores" drop constraint "scores_teacher_assignment_id_fkey";

alter table "public"."students" drop constraint "students_class_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_academic_year_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_class_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_subject_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_teacher_id_fkey";

alter table "public"."activity_log" add constraint "activity_log_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.profiles(id) not valid;

alter table "public"."activity_log" validate constraint "activity_log_actor_id_fkey";

alter table "public"."classes" add constraint "classes_class_teacher_id_fkey" FOREIGN KEY (class_teacher_id) REFERENCES public.profiles(id) not valid;

alter table "public"."classes" validate constraint "classes_class_teacher_id_fkey";

alter table "public"."scores" add constraint "scores_student_id_fkey1" FOREIGN KEY (student_id) REFERENCES public.students(id) not valid;

alter table "public"."scores" validate constraint "scores_student_id_fkey1";

alter table "public"."scores" add constraint "scores_teacher_assignment_id_fkey" FOREIGN KEY (teacher_assignment_id) REFERENCES public.teacher_assignments(id) not valid;

alter table "public"."scores" validate constraint "scores_teacher_assignment_id_fkey";

alter table "public"."students" add constraint "students_class_id_fkey" FOREIGN KEY (class_id) REFERENCES public.classes(id) not valid;

alter table "public"."students" validate constraint "students_class_id_fkey";

alter table "public"."teacher_assignments" add constraint "teacher_assignments_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) not valid;

alter table "public"."teacher_assignments" validate constraint "teacher_assignments_academic_year_id_fkey";

alter table "public"."teacher_assignments" add constraint "teacher_assignments_class_id_fkey" FOREIGN KEY (class_id) REFERENCES public.classes(id) not valid;

alter table "public"."teacher_assignments" validate constraint "teacher_assignments_class_id_fkey";

alter table "public"."teacher_assignments" add constraint "teacher_assignments_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES public.subjects(id) not valid;

alter table "public"."teacher_assignments" validate constraint "teacher_assignments_subject_id_fkey";

alter table "public"."teacher_assignments" add constraint "teacher_assignments_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) not valid;

alter table "public"."teacher_assignments" validate constraint "teacher_assignments_teacher_id_fkey";

create or replace view "public"."class_results_view" as  WITH scored AS (
         SELECT ta.id AS teacher_assignment_id,
            ta.teacher_id,
            ta.class_id,
            c.name AS class_name,
            ta.subject_id,
            s.name AS subject_name,
            ta.academic_year_id,
            ay.name AS academic_year,
            sc.term,
            sc.student_id,
            st.full_name AS student_name,
            ((((COALESCE(sc.classwork, (0)::numeric) + COALESCE(sc.groupwork, (0)::numeric)) + COALESCE(sc.projectwork, (0)::numeric)) + COALESCE(sc.test, (0)::numeric)) + COALESCE(sc.exam_score, (0)::numeric)) AS total_score,
            (((((COALESCE(sc.classwork, (0)::numeric) + COALESCE(sc.groupwork, (0)::numeric)) + COALESCE(sc.projectwork, (0)::numeric)) + COALESCE(sc.test, (0)::numeric)) + COALESCE(sc.exam_score, (0)::numeric)) / 5.0) AS average_score
           FROM (((((public.teacher_assignments ta
             JOIN public.classes c ON ((c.id = ta.class_id)))
             JOIN public.subjects s ON ((s.id = ta.subject_id)))
             JOIN public.academic_years ay ON ((ay.id = ta.academic_year_id)))
             JOIN public.scores sc ON ((sc.teacher_assignment_id = ta.id)))
             JOIN public.students st ON ((st.id = sc.student_id)))
        )
 SELECT teacher_assignment_id,
    teacher_id,
    class_id,
    class_name,
    subject_id,
    subject_name,
    academic_year_id,
    academic_year,
    term,
    student_id,
    student_name,
    total_score,
    average_score,
    dense_rank() OVER (PARTITION BY teacher_assignment_id ORDER BY average_score DESC) AS "position"
   FROM scored;


create or replace view "public"."overall_class_student_ranking_view" as  WITH per_subject AS (
         SELECT ta.class_id,
            ta.academic_year_id,
            s.term,
            s.student_id,
            p.full_name AS student_name,
            s.teacher_assignment_id,
            ta.subject_id,
            (((((s.classwork + s.groupwork) + s.projectwork) + s.test) / 2.0) + (s.exam_score / 2.0)) AS subject_grand_total
           FROM ((public.scores s
             JOIN public.teacher_assignments ta ON ((ta.id = s.teacher_assignment_id)))
             JOIN public.profiles p ON ((p.id = s.student_id)))
        ), aggregated AS (
         SELECT per_subject.class_id,
            per_subject.academic_year_id,
            per_subject.term,
            per_subject.student_id,
            per_subject.student_name,
            avg(per_subject.subject_grand_total) AS overall_average_score
           FROM per_subject
          GROUP BY per_subject.class_id, per_subject.academic_year_id, per_subject.term, per_subject.student_id, per_subject.student_name
        ), ranked AS (
         SELECT aggregated.class_id,
            aggregated.academic_year_id,
            aggregated.term,
            aggregated.student_id,
            aggregated.student_name,
            aggregated.overall_average_score,
            dense_rank() OVER (PARTITION BY aggregated.class_id, aggregated.academic_year_id, aggregated.term ORDER BY aggregated.overall_average_score DESC) AS overall_position
           FROM aggregated
        )
 SELECT class_id,
    ( SELECT c.name
           FROM public.classes c
          WHERE (c.id = r.class_id)) AS class_name,
    academic_year_id,
    ( SELECT ay.name
           FROM public.academic_years ay
          WHERE (ay.id = r.academic_year_id)) AS academic_year,
    term,
    student_id,
    student_name,
    overall_average_score,
    overall_position
   FROM ranked r;


create or replace view "public"."student_result_view" as  WITH computed AS (
         SELECT s.id,
            s.student_id,
            s.teacher_assignment_id,
            s.term,
            s.created_at,
            s.classwork,
            s.groupwork,
            s.projectwork,
            s.test,
            s.exam_score,
            (((s.classwork + s.groupwork) + s.projectwork) + s.test) AS ca_total,
            ((((s.classwork + s.groupwork) + s.projectwork) + s.test) / 2.0) AS ca_50,
            (s.exam_score / 2.0) AS exam_50,
            (((((s.classwork + s.groupwork) + s.projectwork) + s.test) / 2.0) + (s.exam_score / 2.0)) AS grand_total
           FROM public.scores s
        )
 SELECT c.id AS score_id,
    c.student_id,
    p.full_name AS student_name,
    ta.id AS teacher_assignment_id,
    ta.class_id,
    ta.subject_id,
    ta.academic_year_id,
    cl.name AS class_name,
    sub.name AS subject_name,
    ay.name AS academic_year,
    c.term,
    c.classwork,
    c.groupwork,
    c.projectwork,
    c.test,
    c.exam_score,
    c.ca_total,
    c.ca_50,
    c.exam_50,
    c.grand_total,
        CASE
            WHEN (c.grand_total >= (80)::numeric) THEN '1'::text
            WHEN (c.grand_total >= (75)::numeric) THEN '2'::text
            WHEN (c.grand_total >= (70)::numeric) THEN '3'::text
            WHEN (c.grand_total >= (60)::numeric) THEN '4'::text
            WHEN (c.grand_total >= (55)::numeric) THEN '5'::text
            WHEN (c.grand_total >= (50)::numeric) THEN '6'::text
            WHEN (c.grand_total >= (40)::numeric) THEN '7'::text
            WHEN (c.grand_total >= (35)::numeric) THEN '8'::text
            ELSE '9'::text
        END AS grade,
        CASE
            WHEN (c.grand_total >= (80)::numeric) THEN 'Highest'::text
            WHEN (c.grand_total >= (75)::numeric) THEN 'Higher'::text
            WHEN (c.grand_total >= (70)::numeric) THEN 'High'::text
            WHEN (c.grand_total >= (60)::numeric) THEN 'High Average'::text
            WHEN (c.grand_total >= (55)::numeric) THEN 'Average'::text
            WHEN (c.grand_total >= (50)::numeric) THEN 'Low Average'::text
            WHEN (c.grand_total >= (40)::numeric) THEN 'Low'::text
            WHEN (c.grand_total >= (35)::numeric) THEN 'Lower'::text
            ELSE 'Lowest'::text
        END AS remarks
   FROM (((((computed c
     JOIN public.profiles p ON ((p.id = c.student_id)))
     JOIN public.teacher_assignments ta ON ((ta.id = c.teacher_assignment_id)))
     JOIN public.classes cl ON ((cl.id = ta.class_id)))
     JOIN public.subjects sub ON ((sub.id = ta.subject_id)))
     JOIN public.academic_years ay ON ((ay.id = ta.academic_year_id)));


create or replace view "public"."teacher_assignment_rankings_view" as  WITH ranked AS (
         SELECT ta.id AS teacher_assignment_id,
            ta.teacher_id,
            ta.class_id,
            c.name AS class_name,
            ta.subject_id,
            s.name AS subject_name,
            ta.academic_year_id,
            ay.name AS academic_year,
            sc.term,
            sc.student_id,
            st.full_name AS student_name,
            ((((COALESCE(sc.classwork, (0)::numeric) + COALESCE(sc.groupwork, (0)::numeric)) + COALESCE(sc.projectwork, (0)::numeric)) + COALESCE(sc.test, (0)::numeric)) + COALESCE(sc.exam_score, (0)::numeric)) AS total_score,
            ((((((COALESCE(sc.classwork, (0)::numeric) + COALESCE(sc.groupwork, (0)::numeric)) + COALESCE(sc.projectwork, (0)::numeric)) + COALESCE(sc.test, (0)::numeric)) + COALESCE(sc.exam_score, (0)::numeric)) / 200.0) * 100.0) AS percentage_score,
            dense_rank() OVER (PARTITION BY ta.id ORDER BY ((((COALESCE(sc.classwork, (0)::numeric) + COALESCE(sc.groupwork, (0)::numeric)) + COALESCE(sc.projectwork, (0)::numeric)) + COALESCE(sc.test, (0)::numeric)) + COALESCE(sc.exam_score, (0)::numeric)) DESC) AS "position"
           FROM (((((public.teacher_assignments ta
             JOIN public.classes c ON ((c.id = ta.class_id)))
             JOIN public.subjects s ON ((s.id = ta.subject_id)))
             JOIN public.academic_years ay ON ((ay.id = ta.academic_year_id)))
             JOIN public.scores sc ON ((sc.teacher_assignment_id = ta.id)))
             JOIN public.students st ON ((st.id = sc.student_id)))
        )
 SELECT teacher_assignment_id,
    teacher_id,
    class_id,
    class_name,
    subject_id,
    subject_name,
    academic_year_id,
    academic_year,
    term,
    student_id,
    student_name,
    total_score,
    percentage_score,
    "position"
   FROM ranked;


create or replace view "public"."teacher_assignment_students_view" as  SELECT ta.id AS teacher_assignment_id,
    ta.teacher_id,
    ta.class_id,
    ta.academic_year_id,
    st.id AS student_id,
    st.full_name AS student_name,
    sc.id AS score_id,
    sc.term,
    sc.classwork,
    sc.groupwork,
    sc.projectwork,
    sc.test,
    sc.exam_score
   FROM ((public.teacher_assignments ta
     JOIN public.students st ON ((st.class_id = ta.class_id)))
     LEFT JOIN public.scores sc ON (((sc.teacher_assignment_id = ta.id) AND (sc.student_id = st.id))))
  WHERE (st.active IS DISTINCT FROM false);


create or replace view "public"."teacher_dashboard_view" as  SELECT ta.id AS assignment_id,
    ta.teacher_id,
    p.full_name AS teacher_name,
    ta.class_id,
    ta.subject_id,
    ta.academic_year_id,
    c.name AS class_name,
    s.name AS subject_name,
    ay.name AS academic_year,
    ( SELECT sc.term
           FROM public.scores sc
          WHERE (sc.teacher_assignment_id = ta.id)
          ORDER BY sc.created_at DESC
         LIMIT 1) AS term
   FROM ((((public.teacher_assignments ta
     JOIN public.profiles p ON ((p.id = ta.teacher_id)))
     JOIN public.classes c ON ((c.id = ta.class_id)))
     JOIN public.subjects s ON ((s.id = ta.subject_id)))
     JOIN public.academic_years ay ON ((ay.id = ta.academic_year_id)))
  ORDER BY ta.created_at DESC;


create or replace view "public"."teacher_performance_dashboard_view" as  WITH teachers AS (
         SELECT p.id AS teacher_id,
            p.full_name AS teacher_name
           FROM public.profiles p
          WHERE (p.role = 'teacher'::text)
        ), teacher_scores AS (
         SELECT ta.teacher_id,
            sr.grand_total
           FROM (public.teacher_assignments ta
             LEFT JOIN public.student_result_view sr ON ((sr.teacher_assignment_id = ta.id)))
        ), aggregated AS (
         SELECT t.teacher_id,
            t.teacher_name,
            count(ts.grand_total) AS total_scores,
            COALESCE(round(avg(ts.grand_total), 2), (0)::numeric) AS average_score,
            COALESCE(max(ts.grand_total), (0)::numeric) AS highest_score,
            COALESCE(min(ts.grand_total), (0)::numeric) AS lowest_score
           FROM (teachers t
             LEFT JOIN teacher_scores ts ON ((ts.teacher_id = t.teacher_id)))
          GROUP BY t.teacher_id, t.teacher_name
        ), ranked AS (
         SELECT a.teacher_id,
            a.teacher_name,
            a.total_scores,
            a.average_score,
            a.highest_score,
            a.lowest_score,
            dense_rank() OVER (ORDER BY a.average_score DESC) AS teacher_rank
           FROM aggregated a
        )
 SELECT teacher_id,
    teacher_name,
    total_scores,
    average_score,
    highest_score,
    lowest_score,
    teacher_rank,
        CASE
            WHEN ((teacher_rank % (100)::bigint) = ANY (ARRAY[(11)::bigint, (12)::bigint, (13)::bigint])) THEN concat(teacher_rank, 'th')
            WHEN ((teacher_rank % (10)::bigint) = 1) THEN concat(teacher_rank, 'st')
            WHEN ((teacher_rank % (10)::bigint) = 2) THEN concat(teacher_rank, 'nd')
            WHEN ((teacher_rank % (10)::bigint) = 3) THEN concat(teacher_rank, 'rd')
            ELSE concat(teacher_rank, 'th')
        END AS teacher_position
   FROM ranked r
  ORDER BY teacher_rank, teacher_name;


create or replace view "public"."teacher_performance_view" as  WITH base AS (
         SELECT sr.teacher_assignment_id,
            ta.teacher_id,
            sr.grand_total
           FROM (public.student_result_view sr
             JOIN public.teacher_assignments ta ON ((ta.id = sr.teacher_assignment_id)))
        ), aggregated AS (
         SELECT base.teacher_id,
            count(*) AS total_students,
            avg(base.grand_total) AS average_score,
            max(base.grand_total) AS highest_score,
            min(base.grand_total) AS lowest_score
           FROM base
          GROUP BY base.teacher_id
        ), ranked AS (
         SELECT a.teacher_id,
            a.total_students,
            a.average_score,
            a.highest_score,
            a.lowest_score,
            dense_rank() OVER (ORDER BY a.average_score DESC) AS teacher_rank
           FROM aggregated a
        )
 SELECT teacher_id,
    total_students,
    average_score,
    highest_score,
    lowest_score,
    teacher_rank,
        CASE
            WHEN ((teacher_rank % (100)::bigint) = ANY (ARRAY[(11)::bigint, (12)::bigint, (13)::bigint])) THEN concat((teacher_rank)::text, 'th')
            WHEN ((teacher_rank % (10)::bigint) = 1) THEN concat((teacher_rank)::text, 'st')
            WHEN ((teacher_rank % (10)::bigint) = 2) THEN concat((teacher_rank)::text, 'nd')
            WHEN ((teacher_rank % (10)::bigint) = 3) THEN concat((teacher_rank)::text, 'rd')
            ELSE concat((teacher_rank)::text, 'th')
        END AS teacher_position
   FROM ranked r;


create or replace view "public"."teacher_workload_dashboard_view" as  WITH base AS (
         SELECT ta.id AS assignment_id,
            ta.teacher_id,
            ta.class_id,
            ta.subject_id,
            ta.academic_year_id,
            t.full_name AS teacher_name,
            s.name AS subject_name,
            c.name AS class_name,
            ay.name AS academic_year_name
           FROM ((((public.teacher_assignments ta
             JOIN public.profiles t ON ((t.id = ta.teacher_id)))
             JOIN public.subjects s ON ((s.id = ta.subject_id)))
             JOIN public.classes c ON ((c.id = ta.class_id)))
             JOIN public.academic_years ay ON ((ay.id = ta.academic_year_id)))
        ), class_students AS (
         SELECT b_1.assignment_id,
            st.id AS student_id
           FROM (base b_1
             JOIN public.students st ON ((st.class_id = b_1.class_id)))
          WHERE (st.active IS DISTINCT FROM false)
        ), student_scores AS (
         SELECT cs.assignment_id,
            cs.student_id,
            sc.classwork,
            sc.groupwork,
            sc.projectwork,
            sc.test,
            sc.exam_score
           FROM (class_students cs
             LEFT JOIN public.scores sc ON (((sc.teacher_assignment_id = cs.assignment_id) AND (sc.student_id = cs.student_id))))
        ), agg AS (
         SELECT student_scores.assignment_id,
            count(*) AS total_students,
            count(*) FILTER (WHERE (student_scores.classwork IS NOT NULL)) AS classwork_completed,
            count(*) FILTER (WHERE (student_scores.groupwork IS NOT NULL)) AS groupwork_completed,
            count(*) FILTER (WHERE (student_scores.projectwork IS NOT NULL)) AS projectwork_completed,
            count(*) FILTER (WHERE (student_scores.test IS NOT NULL)) AS test_completed,
            count(*) FILTER (WHERE (student_scores.exam_score IS NOT NULL)) AS exam_score_completed,
            ((((count(*) FILTER (WHERE (student_scores.classwork IS NOT NULL)) + count(*) FILTER (WHERE (student_scores.groupwork IS NOT NULL))) + count(*) FILTER (WHERE (student_scores.projectwork IS NOT NULL))) + count(*) FILTER (WHERE (student_scores.test IS NOT NULL))) + count(*) FILTER (WHERE (student_scores.exam_score IS NOT NULL))) AS total_fields_completed,
            (count(*) * 5) AS total_fields_possible
           FROM student_scores
          GROUP BY student_scores.assignment_id
        )
 SELECT b.teacher_id,
    b.teacher_name,
    b.assignment_id,
    b.subject_name,
    b.class_name,
    b.academic_year_name,
    COALESCE(a.total_students, (0)::bigint) AS total_students,
    COALESCE(a.classwork_completed, (0)::bigint) AS classwork_completed,
    COALESCE(a.groupwork_completed, (0)::bigint) AS groupwork_completed,
    COALESCE(a.projectwork_completed, (0)::bigint) AS projectwork_completed,
    COALESCE(a.test_completed, (0)::bigint) AS test_completed,
    COALESCE(a.exam_score_completed, (0)::bigint) AS exam_score_completed,
    round(((100.0 * (COALESCE(a.classwork_completed, (0)::bigint))::numeric) / (NULLIF(a.total_students, 0))::numeric), 1) AS classwork_completion_percentage,
    round(((100.0 * (COALESCE(a.groupwork_completed, (0)::bigint))::numeric) / (NULLIF(a.total_students, 0))::numeric), 1) AS groupwork_completion_percentage,
    round(((100.0 * (COALESCE(a.projectwork_completed, (0)::bigint))::numeric) / (NULLIF(a.total_students, 0))::numeric), 1) AS projectwork_completion_percentage,
    round(((100.0 * (COALESCE(a.test_completed, (0)::bigint))::numeric) / (NULLIF(a.total_students, 0))::numeric), 1) AS test_completion_percentage,
    round(((100.0 * (COALESCE(a.exam_score_completed, (0)::bigint))::numeric) / (NULLIF(a.total_students, 0))::numeric), 1) AS exam_score_completion_percentage,
    round(((100.0 * (COALESCE(a.total_fields_completed, (0)::bigint))::numeric) / (NULLIF(a.total_fields_possible, 0))::numeric), 1) AS grand_total_completion_percentage
   FROM (base b
     LEFT JOIN agg a ON ((a.assignment_id = b.assignment_id)));


create or replace view "public"."teacher_workload_view" as  WITH base AS (
         SELECT ta.teacher_id,
            ta.id AS assignment_id,
            ta.class_id,
            ta.subject_id,
            ta.academic_year_id
           FROM public.teacher_assignments ta
        ), score_stats AS (
         SELECT s.teacher_assignment_id,
            count(*) FILTER (WHERE (s.classwork IS NOT NULL)) AS classwork_filled,
            count(*) FILTER (WHERE (s.groupwork IS NOT NULL)) AS groupwork_filled,
            count(*) FILTER (WHERE (s.projectwork IS NOT NULL)) AS projectwork_filled,
            count(*) FILTER (WHERE (s.test IS NOT NULL)) AS test_filled,
            count(*) FILTER (WHERE (s.exam_score IS NOT NULL)) AS exam_score_filled
           FROM public.scores s
          GROUP BY s.teacher_assignment_id
        ), class_sizes AS (
         SELECT st.class_id,
            count(*) AS total_students
           FROM public.students st
          GROUP BY st.class_id
        ), score_rollup AS (
         SELECT ss.teacher_assignment_id,
            ((((COALESCE(ss.classwork_filled, (0)::bigint) + COALESCE(ss.groupwork_filled, (0)::bigint)) + COALESCE(ss.projectwork_filled, (0)::bigint)) + COALESCE(ss.test_filled, (0)::bigint)) + COALESCE(ss.exam_score_filled, (0)::bigint)) AS scores_entered
           FROM score_stats ss
        )
 SELECT b.teacher_id,
    b.assignment_id,
    b.class_id,
    b.subject_id,
    b.academic_year_id,
    COALESCE(sr.scores_entered, (0)::bigint) AS scores_entered,
    COALESCE(cs.total_students, (0)::bigint) AS total_students,
        CASE
            WHEN (COALESCE(cs.total_students, (0)::bigint) = 0) THEN (0)::numeric
            ELSE round((((COALESCE(sr.scores_entered, (0)::bigint))::numeric / ((cs.total_students)::numeric * (5)::numeric)) * (100)::numeric), 2)
        END AS completion_percentage
   FROM ((base b
     LEFT JOIN score_rollup sr ON ((sr.teacher_assignment_id = b.assignment_id)))
     LEFT JOIN class_sizes cs ON ((cs.class_id = b.class_id)));


create or replace view "public"."school_overview_view" as  WITH stats AS (
         SELECT ( SELECT count(*) AS count
                   FROM public.students) AS total_students,
            ( SELECT count(*) AS count
                   FROM public.profiles
                  WHERE (profiles.role = 'teacher'::text)) AS total_teachers,
            ( SELECT count(*) AS count
                   FROM public.classes) AS total_classes,
            ( SELECT count(*) AS count
                   FROM public.subjects) AS total_subjects,
            ( SELECT count(*) AS count
                   FROM public.scores) AS total_scores_entered,
            ( SELECT avg(student_result_view.grand_total) AS avg
                   FROM public.student_result_view) AS school_average
        ), pass_stats AS (
         SELECT count(*) FILTER (WHERE (student_result_view.grand_total >= (50)::numeric)) AS passed,
            count(*) AS total
           FROM public.student_result_view
        ), top_student AS (
         SELECT student_result_view.student_id,
            student_result_view.student_name,
            student_result_view.grand_total
           FROM public.student_result_view
          ORDER BY student_result_view.grand_total DESC
         LIMIT 1
        ), top_teacher AS (
         SELECT teacher_performance_view.teacher_id,
            teacher_performance_view.average_score,
            teacher_performance_view.teacher_rank
           FROM public.teacher_performance_view
          ORDER BY teacher_performance_view.average_score DESC
         LIMIT 1
        )
 SELECT s.total_students,
    s.total_teachers,
    s.total_classes,
    s.total_subjects,
    s.total_scores_entered,
    s.school_average,
    ps.passed,
    ps.total,
        CASE
            WHEN (ps.total = 0) THEN (0)::double precision
            ELSE (((ps.passed)::double precision / (ps.total)::double precision) * (100)::double precision)
        END AS pass_rate_percentage,
    ts.student_id AS top_student_id,
    ts.student_name AS top_student_name,
    ts.grand_total AS top_student_score,
    tt.teacher_id AS top_teacher_id,
    tt.average_score AS top_teacher_score,
    tt.teacher_rank AS top_teacher_rank
   FROM (((stats s
     CROSS JOIN pass_stats ps)
     CROSS JOIN top_student ts)
     CROSS JOIN top_teacher tt);



  create policy "admin can insert academic_years"
  on "public"."academic_years"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "admin can update academic_years"
  on "public"."academic_years"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "public read academic_years"
  on "public"."academic_years"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "admin can read activity log"
  on "public"."activity_log"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "public read classes"
  on "public"."classes"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "public read profiles"
  on "public"."profiles"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Read own scores"
  on "public"."scores"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))));



  create policy "Teachers can insert scores"
  on "public"."scores"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))));



  create policy "Teachers can insert their own scores"
  on "public"."scores"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))));



  create policy "Teachers can view their own scores"
  on "public"."scores"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))));



  create policy "Update scores"
  on "public"."scores"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.id = scores.teacher_assignment_id) AND (ta.teacher_id = auth.uid())))));



  create policy "public read scores"
  on "public"."scores"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "teachers can read students in their classes"
  on "public"."students"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.class_id = students.class_id) AND (ta.teacher_id = auth.uid())))));



  create policy "public read teacher_assignments"
  on "public"."teacher_assignments"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "admin can insert terms"
  on "public"."terms"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "admin can update terms"
  on "public"."terms"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "public read terms"
  on "public"."terms"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER scores_activity_log_insert AFTER INSERT ON public.scores REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.log_scores_activity();

CREATE TRIGGER scores_activity_log_update AFTER UPDATE ON public.scores REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.log_scores_activity();

CREATE TRIGGER scores_term_open_check BEFORE INSERT OR UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.check_term_open();

CREATE TRIGGER trg_scores_set_teacher_assignment_id BEFORE INSERT ON public.scores FOR EACH ROW EXECUTE FUNCTION public.scores_set_teacher_assignment_id();

CREATE TRIGGER trg_validate_score BEFORE INSERT OR UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.validate_score_student_class();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


