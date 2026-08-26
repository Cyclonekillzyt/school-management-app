drop trigger if exists "scores_activity_log_insert" on "public"."scores";

drop trigger if exists "scores_activity_log_update" on "public"."scores";

drop trigger if exists "scores_term_open_check" on "public"."scores";

drop trigger if exists "trg_scores_set_teacher_assignment_id" on "public"."scores";

drop trigger if exists "trg_validate_score" on "public"."scores";

drop policy "public read academic_years" on "public"."academic_years";

drop policy "public read classes" on "public"."classes";

drop policy "public read profiles" on "public"."profiles";

drop policy "public read scores" on "public"."scores";

drop policy "public read teacher_assignments" on "public"."teacher_assignments";

drop policy "public read terms" on "public"."terms";

drop policy "admin can insert academic_years" on "public"."academic_years";

drop policy "admin can update academic_years" on "public"."academic_years";

drop policy "admin can read activity log" on "public"."activity_log";

drop policy "Read own scores" on "public"."scores";

drop policy "Teachers can insert scores" on "public"."scores";

drop policy "Teachers can insert their own scores" on "public"."scores";

drop policy "Teachers can view their own scores" on "public"."scores";

drop policy "Update scores" on "public"."scores";

drop policy "teachers can read students in their classes" on "public"."students";

drop policy "admin can insert terms" on "public"."terms";

drop policy "admin can update terms" on "public"."terms";

alter table "public"."activity_log" drop constraint "activity_log_actor_id_fkey";

alter table "public"."classes" drop constraint "classes_class_teacher_id_fkey";

alter table "public"."scores" drop constraint "scores_student_id_fkey1";

alter table "public"."scores" drop constraint "scores_teacher_assignment_id_fkey";

alter table "public"."students" drop constraint "students_class_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_academic_year_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_class_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_subject_id_fkey";

alter table "public"."teacher_assignments" drop constraint "teacher_assignments_teacher_id_fkey";

drop function if exists "public"."admin_assignment_students"(p_assignment_id uuid);

drop function if exists "public"."admin_student_subject_scores"(p_student_id uuid);


  create table "public"."promotions_log" (
    "id" uuid not null default gen_random_uuid(),
    "actor_id" uuid,
    "student_ids" uuid[] not null,
    "source_class_id" uuid,
    "source_class_name" text,
    "target_class_id" uuid,
    "target_class_name" text,
    "deactivated" boolean not null default false,
    "previously_active" jsonb not null default '{}'::jsonb,
    "undone" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."promotions_log" enable row level security;


  create table "public"."student_class_history" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "class_id" uuid,
    "class_name" text not null,
    "academic_year_id" uuid,
    "academic_year_name" text,
    "recorded_at" timestamp with time zone not null default now()
      );


alter table "public"."student_class_history" enable row level security;

alter table "public"."profiles" add column "must_reset_password" boolean not null default false;

alter table "public"."students" add column "address" text;

alter table "public"."students" add column "admission_number" text;

alter table "public"."students" add column "date_of_birth" date;

alter table "public"."students" add column "gender" text;

alter table "public"."students" add column "parent_name" text;

alter table "public"."students" add column "parent_phone" text;

CREATE INDEX idx_promotions_log_actor ON public.promotions_log USING btree (actor_id);

CREATE INDEX idx_student_class_history_student ON public.student_class_history USING btree (student_id);

CREATE UNIQUE INDEX promotions_log_pkey ON public.promotions_log USING btree (id);

CREATE UNIQUE INDEX student_class_history_pkey ON public.student_class_history USING btree (id);

alter table "public"."promotions_log" add constraint "promotions_log_pkey" PRIMARY KEY using index "promotions_log_pkey";

alter table "public"."student_class_history" add constraint "student_class_history_pkey" PRIMARY KEY using index "student_class_history_pkey";

alter table "public"."promotions_log" add constraint "promotions_log_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.profiles(id) not valid;

alter table "public"."promotions_log" validate constraint "promotions_log_actor_id_fkey";

alter table "public"."student_class_history" add constraint "student_class_history_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE SET NULL not valid;

alter table "public"."student_class_history" validate constraint "student_class_history_academic_year_id_fkey";

alter table "public"."student_class_history" add constraint "student_class_history_class_id_fkey" FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL not valid;

alter table "public"."student_class_history" validate constraint "student_class_history_class_id_fkey";

alter table "public"."student_class_history" add constraint "student_class_history_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.students(id) not valid;

alter table "public"."student_class_history" validate constraint "student_class_history_student_id_fkey";

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

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_bulk_import_subjects(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  rec jsonb;
  v_inserted int := 0;
  v_failed int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_idx int := 0;
  v_subject_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  for rec in select jsonb_array_elements(payload)
  loop
    v_idx := v_idx + 1;

    if coalesce(trim(rec->>'name'), '') = '' then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object('row', v_idx, 'reason', 'Missing subject name');
      continue;
    end if;

    if exists (
      select 1 from public.subjects sub
       where lower(sub.name) = lower(trim(rec->>'name'))
    ) then
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object(
        'row', v_idx,
        'reason', 'Subject already exists: ' || (rec->>'name')
      );
      continue;
    end if;

    insert into public.subjects (name)
    values (trim(rec->>'name'))
    returning id into v_subject_id;

    perform public.log_activity('subject_created', 'subject', v_subject_id, trim(rec->>'name'));
    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'failed', v_failed, 'errors', v_errors);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_search_students(p_query text)
 RETURNS TABLE(student_id uuid, student_name text, class_name text, active boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  return query
  select s.id, s.full_name, c.name, s.active
  from public.students s
  join public.classes c on c.id = s.class_id
  where s.full_name ilike '%' || trim(p_query) || '%'
  order by s.full_name
  limit 30;
end; $function$
;

CREATE OR REPLACE FUNCTION public.admin_student_class_history(p_student_id uuid)
 RETURNS TABLE(class_name text, academic_year_name text, recorded_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  return query
  select sch.class_name, sch.academic_year_name, sch.recorded_at
    from public.student_class_history sch
   where sch.student_id = p_student_id
   order by sch.recorded_at desc;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.can_manage_class(p_class_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.is_admin()
      or exists (
        select 1 from public.classes c
         where c.id = p_class_id and c.class_teacher_id = auth.uid()
      );
$function$
;

CREATE OR REPLACE FUNCTION public.class_students_for_promotion(p_class_id uuid)
 RETURNS TABLE(student_id uuid, student_name text, active boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Access denied: you do not manage this class';
  end if;

  return query
  select s.id, s.full_name, s.active
    from public.students s
   where s.class_id = p_class_id
   order by s.full_name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_class_students(p_class_id uuid)
 RETURNS TABLE(student_id uuid, student_name text, average_score numeric, "position" bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.can_manage_class(p_class_id) then
    raise exception 'Access denied: you do not manage this class';
  end if;

  return query
  with per_student as (
    select
      st.id as student_id,
      st.full_name as student_name,
      round(avg(srv.grand_total), 2) as average_score
    from public.students st
    left join public.student_result_view srv
      on srv.student_id = st.id
     and srv.grand_total is not null
     and srv.term = public.current_term_name()
    where st.class_id = p_class_id
      and st.active = true
    group by st.id, st.full_name
  )
  select
    student_id,
    student_name,
    average_score,
    rank() over (order by average_score desc nulls last) as "position"
  from per_student
  order by "position";
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_manageable_classes()
 RETURNS TABLE(class_id uuid, class_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select c.id, c.name
    from public.classes c
   where public.is_admin() or c.class_teacher_id = auth.uid()
   order by c.name;
$function$
;

CREATE OR REPLACE FUNCTION public.my_recent_promotions(p_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, student_ids uuid[], source_class_name text, target_class_name text, deactivated boolean, undone boolean, created_at timestamp with time zone, student_count integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    pl.id, pl.student_ids, pl.source_class_name, pl.target_class_name,
    pl.deactivated, pl.undone, pl.created_at, array_length(pl.student_ids, 1)
  from public.promotions_log pl
  where public.is_admin() or pl.actor_id = auth.uid()
  order by pl.created_at desc
  limit p_limit;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_students(p_student_ids uuid[], p_target_class_id uuid, p_deactivate boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_source_class_id uuid;
  v_distinct_classes int;
  v_source_name text;
  v_target_name text;
  v_count int;
  v_year_id uuid;
  v_year_name text;
  v_previously_active jsonb;
  v_promotion_id uuid;
begin
  if p_student_ids is null or array_length(p_student_ids, 1) is null then
    raise exception 'No students selected';
  end if;

  select count(distinct class_id), max(class_id)
    into v_distinct_classes, v_source_class_id
    from public.students
   where id = any(p_student_ids);

  if v_distinct_classes <> 1 then
    raise exception 'Selected students must all belong to the same class';
  end if;

  if not public.can_manage_class(v_source_class_id) then
    raise exception 'Access denied: you do not manage this class';
  end if;

  if not exists (select 1 from public.classes where id = p_target_class_id) then
    raise exception 'Target class not found';
  end if;

  v_count := array_length(p_student_ids, 1);

  select name into v_source_name from public.classes where id = v_source_class_id;
  select name into v_target_name from public.classes where id = p_target_class_id;
  select id, name into v_year_id, v_year_name from public.academic_years where current = true limit 1;

  -- snapshot who was active before, so an undo restores exact prior state
  select jsonb_object_agg(id::text, active)
    into v_previously_active
    from public.students
   where id = any(p_student_ids);

  -- record the class they're leaving, before we move them
  insert into public.student_class_history (student_id, class_id, class_name, academic_year_id, academic_year_name)
  select s.id, v_source_class_id, v_source_name, v_year_id, v_year_name
    from public.students s
   where s.id = any(p_student_ids);

  update public.students
     set class_id = p_target_class_id,
         active = case when p_deactivate then false else active end
   where id = any(p_student_ids);

  insert into public.promotions_log (
    actor_id, student_ids, source_class_id, source_class_name,
    target_class_id, target_class_name, deactivated, previously_active
  )
  values (
    auth.uid(), p_student_ids, v_source_class_id, v_source_name,
    p_target_class_id, v_target_name, p_deactivate, coalesce(v_previously_active, '{}'::jsonb)
  )
  returning id into v_promotion_id;

  perform public.log_activity(
    'students_promoted',
    'class',
    p_target_class_id,
    v_count || ' student' || case when v_count = 1 then '' else 's' end
      || ' moved from ' || coalesce(v_source_name, '?') || ' to ' || coalesce(v_target_name, '?')
      || case when p_deactivate then ' (deactivated)' else '' end,
    jsonb_build_object('promotion_id', v_promotion_id)
  );

  return jsonb_build_object('promoted', v_count, 'promotion_id', v_promotion_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.undo_promotion(p_promotion_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row public.promotions_log%rowtype;
begin
  select * into v_row from public.promotions_log where id = p_promotion_id;

  if v_row.id is null then
    raise exception 'Promotion not found';
  end if;

  if v_row.undone then
    raise exception 'This promotion has already been undone';
  end if;

  if not (public.is_admin() or v_row.actor_id = auth.uid()) then
    raise exception 'Access denied: only the person who promoted these students, or an admin, can undo it';
  end if;

  if v_row.created_at < now() - interval '24 hours' then
    raise exception 'This promotion is more than 24 hours old and can no longer be undone automatically';
  end if;

  update public.students st
     set class_id = v_row.source_class_id,
         active = coalesce((v_row.previously_active ->> st.id::text)::boolean, st.active)
   where st.id = any(v_row.student_ids);

  update public.promotions_log set undone = true where id = p_promotion_id;

  perform public.log_activity(
    'promotion_undone',
    'class',
    v_row.source_class_id,
    array_length(v_row.student_ids, 1) || ' student' ||
      case when array_length(v_row.student_ids, 1) = 1 then '' else 's' end ||
      ' moved back to ' || coalesce(v_row.source_class_name, '?'),
    jsonb_build_object('promotion_id', p_promotion_id)
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_bulk_import_classes(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  rec jsonb;
  v_class_teacher_id uuid;
  v_class_teacher_email text;
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
    v_class_teacher_email := trim(rec->>'class_teacher_email');

    if v_class_teacher_email is not null and v_class_teacher_email <> '' then
      select pr.id
        into v_class_teacher_id
        from public.profiles pr
       where lower(pr.email) = lower(v_class_teacher_email)
         and pr.role = 'teacher'
       limit 1;

      -- email was provided but didn't resolve: fail the row instead of
      -- silently creating the class with no class teacher
      if v_class_teacher_id is null then
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_object(
          'row', v_idx,
          'reason', 'Class teacher not found for email: ' || v_class_teacher_email
        );
        continue;
      end if;
    end if;

    insert into public.classes (name, class_teacher_id)
    values (trim(rec->>'name'), v_class_teacher_id)
    returning id into v_class_id;

    perform public.log_activity('class_created', 'class', v_class_id, trim(rec->>'name'));
    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'failed', v_failed, 'errors', v_errors);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_class_broadsheet(p_class_id uuid)
 RETURNS TABLE(student_id uuid, student_name text, subject_name text, grand_total numeric, grade text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  join public.subjects sub on sub.id = ta.subject_id
  left join public.student_result_view srv
    on srv.student_id = s.id
   and srv.teacher_assignment_id = ta.id
  where s.class_id = p_class_id
    and ta.class_id = p_class_id
    and ta.academic_year_id = (select id from public.academic_years where current = true limit 1)
    and s.active = true
  order by s.full_name, sub.name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_class_subjects(p_class_id uuid)
 RETURNS TABLE(assignment_id uuid, subject_id uuid, subject_name text, teacher_id uuid, teacher_name text, average_score numeric, completion_percentage numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    and ta.academic_year_id = (select id from public.academic_years where current = true limit 1)
  order by s.name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_academic_year_archived(p_id uuid, p_archived boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.academic_years
     set archived = p_archived
   where id = p_id;

  select name into v_name from public.academic_years where id = p_id;
  perform public.log_activity(
    case when p_archived then 'academic_year_archived' else 'academic_year_unarchived' end,
    'academic_year',
    p_id,
    v_name
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_active_academic_year(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.academic_years
     set current = false
   where current = true;

  update public.academic_years
     set current = true,
         archived = false
   where id = p_id;

  select name into v_name from public.academic_years where id = p_id;
  perform public.log_activity('academic_year_activated', 'academic_year', p_id, v_name);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_active_term(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.terms
     set is_current = false
   where is_current = true;

  update public.terms
     set is_current = true
   where id = p_id;

  select name into v_name from public.terms where id = p_id;
  perform public.log_activity('term_activated', 'term', p_id, v_name);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_student_active(p_student_id uuid, p_active boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  select full_name into v_name from public.students where id = p_student_id;

  update public.students
     set active = p_active
   where id = p_student_id;

  perform public.log_activity(
    case when p_active then 'student_reactivated' else 'student_deactivated' end,
    'student',
    p_student_id,
    v_name
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_teacher_active(p_teacher_id uuid, p_active boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  update public.profiles
     set active = p_active
   where id = p_teacher_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_term_open(p_id uuid, p_open boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_name text;
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;

  update public.terms
     set is_open = p_open
   where id = p_id;

  select name into v_name from public.terms where id = p_id;
  perform public.log_activity(
    case when p_open then 'term_opened' else 'term_closed' end,
    'term',
    p_id,
    v_name
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_student_subject_scores(p_student_id uuid, p_term text DEFAULT NULL::text)
 RETURNS TABLE(subject_id uuid, subject_name text, teacher_name text, term text, classwork numeric, groupwork numeric, projectwork numeric, test numeric, exam_score numeric, grand_total numeric, grade text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_term text;
  v_class_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Access denied: admin only';
  end if;

  v_term := coalesce(p_term, public.current_term_name());
  select class_id into v_class_id from public.students where id = p_student_id;

  return query
  select
    sub.id as subject_id,
    sub.name as subject_name,
    pr.full_name as teacher_name,
    v_term as term,
    srv.classwork,
    srv.groupwork,
    srv.projectwork,
    srv.test,
    srv.exam_score,
    srv.grand_total,
    srv.grade
  from public.teacher_assignments ta
  join public.subjects sub on sub.id = ta.subject_id
  join public.profiles pr on pr.id = ta.teacher_id
  left join public.student_result_view srv
    on srv.teacher_assignment_id = ta.id
   and srv.student_id = p_student_id
   and srv.term = v_term
  where ta.class_id = v_class_id
    and ta.academic_year_id = (select id from public.academic_years where current = true limit 1)
  order by sub.name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_teacher_assignments(p_teacher_id uuid)
 RETURNS TABLE(assignment_id uuid, class_id uuid, class_name text, subject_id uuid, subject_name text, total_students bigint, completion_percentage numeric, average_score numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    and ta.academic_year_id = (select id from public.academic_years where current = true limit 1)
  order by c.name, s.name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_class(p_class_id uuid, p_name text, p_class_teacher_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Class name is required'; end if;

  update public.classes
     set name = trim(p_name),
         class_teacher_id = p_class_teacher_id
   where id = p_class_id;

  perform public.log_activity('class_updated', 'class', p_class_id, trim(p_name));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_student(p_student_id uuid, p_full_name text, p_class_id uuid, p_admission_number text DEFAULT NULL::text, p_gender text DEFAULT NULL::text, p_date_of_birth date DEFAULT NULL::date, p_parent_name text DEFAULT NULL::text, p_parent_phone text DEFAULT NULL::text, p_address text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_full_name), '') = '' then raise exception 'Student name is required'; end if;

  update public.students
     set full_name = trim(p_full_name),
         class_id = p_class_id,
         admission_number = nullif(trim(p_admission_number), ''),
         gender = nullif(trim(p_gender), ''),
         date_of_birth = p_date_of_birth,
         parent_name = nullif(trim(p_parent_name), ''),
         parent_phone = nullif(trim(p_parent_phone), ''),
         address = nullif(trim(p_address), '')
   where id = p_student_id;

  perform public.log_activity('student_updated', 'student', p_student_id, trim(p_full_name));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_subject(p_subject_id uuid, p_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Access denied: admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Subject name is required'; end if;

  update public.subjects
     set name = trim(p_name)
   where id = p_subject_id;

  perform public.log_activity('subject_updated', 'subject', p_subject_id, trim(p_name));
end;
$function$
;

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
            st.full_name AS student_name,
            s.teacher_assignment_id,
            ta.subject_id,
            (((((s.classwork + s.groupwork) + s.projectwork) + s.test) / 2.0) + (s.exam_score / 2.0)) AS subject_grand_total
           FROM ((public.scores s
             JOIN public.teacher_assignments ta ON ((ta.id = s.teacher_assignment_id)))
             JOIN public.students st ON ((st.id = s.student_id)))
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
    st.full_name AS student_name,
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
     JOIN public.students st ON ((st.id = c.student_id)))
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


grant delete on table "public"."promotions_log" to "anon";

grant insert on table "public"."promotions_log" to "anon";

grant references on table "public"."promotions_log" to "anon";

grant select on table "public"."promotions_log" to "anon";

grant trigger on table "public"."promotions_log" to "anon";

grant truncate on table "public"."promotions_log" to "anon";

grant update on table "public"."promotions_log" to "anon";

grant delete on table "public"."promotions_log" to "authenticated";

grant insert on table "public"."promotions_log" to "authenticated";

grant references on table "public"."promotions_log" to "authenticated";

grant select on table "public"."promotions_log" to "authenticated";

grant trigger on table "public"."promotions_log" to "authenticated";

grant truncate on table "public"."promotions_log" to "authenticated";

grant update on table "public"."promotions_log" to "authenticated";

grant delete on table "public"."promotions_log" to "service_role";

grant insert on table "public"."promotions_log" to "service_role";

grant references on table "public"."promotions_log" to "service_role";

grant select on table "public"."promotions_log" to "service_role";

grant trigger on table "public"."promotions_log" to "service_role";

grant truncate on table "public"."promotions_log" to "service_role";

grant update on table "public"."promotions_log" to "service_role";

grant delete on table "public"."student_class_history" to "anon";

grant insert on table "public"."student_class_history" to "anon";

grant references on table "public"."student_class_history" to "anon";

grant select on table "public"."student_class_history" to "anon";

grant trigger on table "public"."student_class_history" to "anon";

grant truncate on table "public"."student_class_history" to "anon";

grant update on table "public"."student_class_history" to "anon";

grant delete on table "public"."student_class_history" to "authenticated";

grant insert on table "public"."student_class_history" to "authenticated";

grant references on table "public"."student_class_history" to "authenticated";

grant select on table "public"."student_class_history" to "authenticated";

grant trigger on table "public"."student_class_history" to "authenticated";

grant truncate on table "public"."student_class_history" to "authenticated";

grant update on table "public"."student_class_history" to "authenticated";

grant delete on table "public"."student_class_history" to "service_role";

grant insert on table "public"."student_class_history" to "service_role";

grant references on table "public"."student_class_history" to "service_role";

grant select on table "public"."student_class_history" to "service_role";

grant trigger on table "public"."student_class_history" to "service_role";

grant truncate on table "public"."student_class_history" to "service_role";

grant update on table "public"."student_class_history" to "service_role";


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



  create policy "admin can read activity log"
  on "public"."activity_log"
  as permissive
  for select
  to authenticated
using (public.is_admin());



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



  create policy "teachers can read students in their classes"
  on "public"."students"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.class_id = students.class_id) AND (ta.teacher_id = auth.uid())))));



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


CREATE TRIGGER scores_activity_log_insert AFTER INSERT ON public.scores REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.log_scores_activity();

CREATE TRIGGER scores_activity_log_update AFTER UPDATE ON public.scores REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.log_scores_activity();

CREATE TRIGGER scores_term_open_check BEFORE INSERT OR UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.check_term_open();

CREATE TRIGGER trg_scores_set_teacher_assignment_id BEFORE INSERT ON public.scores FOR EACH ROW EXECUTE FUNCTION public.scores_set_teacher_assignment_id();

CREATE TRIGGER trg_validate_score BEFORE INSERT OR UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.validate_score_student_class();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


