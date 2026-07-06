
  create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."comments" enable row level security;


  create table "public"."conversation_members" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "full_name" text
      );


alter table "public"."conversation_members" enable row level security;


  create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "chat_key" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."conversations" enable row level security;


  create table "public"."follows" (
    "id" uuid not null default gen_random_uuid(),
    "follower_id" uuid,
    "following_id" uuid,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."follows" enable row level security;


  create table "public"."likes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."likes" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "receiver_id" uuid not null,
    "sender_id" uuid not null,
    "sender_name" text,
    "type" text not null,
    "message" text,
    "post_id" uuid,
    "read" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."post_shares" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."post_shares" enable row level security;


  create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "profile_name" text,
    "profile_image" text,
    "type" text,
    "description" text,
    "image" text,
    "content" jsonb,
    "created_at" timestamp with time zone default now(),
    "likes_count" integer default 0,
    "category" text default 'all'::text,
    "comments" jsonb default '[]'::jsonb,
    "comments_count" integer default 0,
    "shares_count" integer default 0
      );


alter table "public"."posts" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "username" text,
    "full_name" text,
    "bio" text,
    "avatar_url" text,
    "cover_url" text,
    "website" text,
    "location" text,
    "phone" text,
    "verified" boolean default false,
    "followers_count" integer default 0,
    "following_count" integer default 0,
    "posts_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "age" text,
    "department" text,
    "school" text,
    "relationship_status" text,
    "hobby" text,
    "work" text,
    "fcm_token" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."user_push_tokens" (
    "user_id" uuid not null,
    "token" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_push_tokens" enable row level security;

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX conversation_members_conversation_id_user_id_key ON public.conversation_members USING btree (conversation_id, user_id);

CREATE UNIQUE INDEX conversation_members_pkey ON public.conversation_members USING btree (id);

CREATE UNIQUE INDEX conversations_chat_key_key ON public.conversations USING btree (chat_key);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX follows_follower_id_following_id_key ON public.follows USING btree (follower_id, following_id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (id);

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);

CREATE INDEX idx_members_user ON public.conversation_members USING btree (user_id);

CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (id);

CREATE UNIQUE INDEX likes_user_id_post_id_key ON public.likes USING btree (user_id, post_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX post_shares_pkey ON public.post_shares USING btree (id);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE INDEX profiles_full_name_idx ON public.profiles USING btree (full_name);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX user_push_tokens_pkey ON public.user_push_tokens USING btree (user_id);

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."conversation_members" add constraint "conversation_members_pkey" PRIMARY KEY using index "conversation_members_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."likes" add constraint "likes_pkey" PRIMARY KEY using index "likes_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."post_shares" add constraint "post_shares_pkey" PRIMARY KEY using index "post_shares_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."user_push_tokens" add constraint "user_push_tokens_pkey" PRIMARY KEY using index "user_push_tokens_pkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."comments" add constraint "fk_comments_user" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."comments" validate constraint "fk_comments_user";

alter table "public"."conversation_members" add constraint "conversation_members_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_members" validate constraint "conversation_members_conversation_id_fkey";

alter table "public"."conversation_members" add constraint "conversation_members_conversation_id_user_id_key" UNIQUE using index "conversation_members_conversation_id_user_id_key";

alter table "public"."conversation_members" add constraint "conversation_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_members" validate constraint "conversation_members_user_id_fkey";

alter table "public"."conversations" add constraint "conversations_chat_key_key" UNIQUE using index "conversations_chat_key_key";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_follower_id_following_id_key" UNIQUE using index "follows_follower_id_following_id_key";

alter table "public"."follows" add constraint "follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_id_fkey";

alter table "public"."follows" add constraint "no_self_follow" CHECK ((follower_id <> following_id)) not valid;

alter table "public"."follows" validate constraint "no_self_follow";

alter table "public"."likes" add constraint "likes_user_id_post_id_key" UNIQUE using index "likes_user_id_post_id_key";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrease_followers(target_id uuid, my_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin

  -- person being unfollowed
  update profiles
  set followers_count =
      greatest(coalesce(followers_count, 0) - 1, 0)
  where id = target_id;

  -- person doing the unfollow
  update profiles
  set following_count =
      greatest(coalesce(following_count, 0) - 1, 0)
  where id = my_id;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_follow_counts(follower_id_input uuid, following_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  -- decrease target user's followers
  update profiles
  set followers_count = greatest(coalesce(followers_count, 0) - 1, 0)
  where id = following_id_input;

  -- decrease current user's following
  update profiles
  set following_count = greatest(coalesce(following_count, 0) - 1, 0)
  where id = follower_id_input;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_posts_count(user_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update profiles
  set posts_count = greatest(posts_count - 1, 0)
  where id = user_id_input;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    'user_' || substr(new.id::text, 1, 6),
    null,
    null
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increase_followers(target_id uuid, my_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin

  -- person being followed
  update profiles
  set followers_count = coalesce(followers_count, 0) + 1
  where id = target_id;

  -- person doing the follow
  update profiles
  set following_count = coalesce(following_count, 0) + 1
  where id = my_id;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_follow_counts(follower_id_input uuid, following_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  -- increase target user's followers
  update profiles
  set followers_count = coalesce(followers_count, 0) + 1
  where id = following_id_input;

  -- increase current user's following
  update profiles
  set following_count = coalesce(following_count, 0) + 1
  where id = follower_id_input;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_shares(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update posts
  set shares_count = coalesce(shares_count, 0) + 1,
      updated_at = now()
  where id = post_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_user_posts(user_id_input text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update profiles
  set posts = coalesce(posts, 0) + 1
  where id = user_id_input;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_user_posts(user_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update profiles
  set posts = coalesce(posts, 0) + 1
  where id = user_id_input;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_like(post_id uuid, user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  current_count int;
begin
  -- get current value safely
  select coalesce(likes_count, 0)
  into current_count
  from posts
  where id = post_id;

  -- check if user already liked (stored in a simple jsonb array or similar logic)
  -- BUT since you don't have likes table, we just increment/decrement safely

  update posts
  set likes_count =
    case
      when coalesce(likes_count, 0) > 0 then coalesce(likes_count, 0)
      else 0
    end,
  updated_at = now()
  where id = post_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_comments_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.comments_count :=
    COALESCE(
      jsonb_array_length(NEW.comments),
      0
    );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

begin

new.updated_at = now();

return new;

end;

$function$
;

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."conversation_members" to "anon";

grant insert on table "public"."conversation_members" to "anon";

grant references on table "public"."conversation_members" to "anon";

grant select on table "public"."conversation_members" to "anon";

grant trigger on table "public"."conversation_members" to "anon";

grant truncate on table "public"."conversation_members" to "anon";

grant update on table "public"."conversation_members" to "anon";

grant delete on table "public"."conversation_members" to "authenticated";

grant insert on table "public"."conversation_members" to "authenticated";

grant references on table "public"."conversation_members" to "authenticated";

grant select on table "public"."conversation_members" to "authenticated";

grant trigger on table "public"."conversation_members" to "authenticated";

grant truncate on table "public"."conversation_members" to "authenticated";

grant update on table "public"."conversation_members" to "authenticated";

grant delete on table "public"."conversation_members" to "service_role";

grant insert on table "public"."conversation_members" to "service_role";

grant references on table "public"."conversation_members" to "service_role";

grant select on table "public"."conversation_members" to "service_role";

grant trigger on table "public"."conversation_members" to "service_role";

grant truncate on table "public"."conversation_members" to "service_role";

grant update on table "public"."conversation_members" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";

grant delete on table "public"."likes" to "anon";

grant insert on table "public"."likes" to "anon";

grant references on table "public"."likes" to "anon";

grant select on table "public"."likes" to "anon";

grant trigger on table "public"."likes" to "anon";

grant truncate on table "public"."likes" to "anon";

grant update on table "public"."likes" to "anon";

grant delete on table "public"."likes" to "authenticated";

grant insert on table "public"."likes" to "authenticated";

grant references on table "public"."likes" to "authenticated";

grant select on table "public"."likes" to "authenticated";

grant trigger on table "public"."likes" to "authenticated";

grant truncate on table "public"."likes" to "authenticated";

grant update on table "public"."likes" to "authenticated";

grant delete on table "public"."likes" to "service_role";

grant insert on table "public"."likes" to "service_role";

grant references on table "public"."likes" to "service_role";

grant select on table "public"."likes" to "service_role";

grant trigger on table "public"."likes" to "service_role";

grant truncate on table "public"."likes" to "service_role";

grant update on table "public"."likes" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."post_shares" to "anon";

grant insert on table "public"."post_shares" to "anon";

grant references on table "public"."post_shares" to "anon";

grant select on table "public"."post_shares" to "anon";

grant trigger on table "public"."post_shares" to "anon";

grant truncate on table "public"."post_shares" to "anon";

grant update on table "public"."post_shares" to "anon";

grant delete on table "public"."post_shares" to "authenticated";

grant insert on table "public"."post_shares" to "authenticated";

grant references on table "public"."post_shares" to "authenticated";

grant select on table "public"."post_shares" to "authenticated";

grant trigger on table "public"."post_shares" to "authenticated";

grant truncate on table "public"."post_shares" to "authenticated";

grant update on table "public"."post_shares" to "authenticated";

grant delete on table "public"."post_shares" to "service_role";

grant insert on table "public"."post_shares" to "service_role";

grant references on table "public"."post_shares" to "service_role";

grant select on table "public"."post_shares" to "service_role";

grant trigger on table "public"."post_shares" to "service_role";

grant truncate on table "public"."post_shares" to "service_role";

grant update on table "public"."post_shares" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."user_push_tokens" to "anon";

grant insert on table "public"."user_push_tokens" to "anon";

grant references on table "public"."user_push_tokens" to "anon";

grant select on table "public"."user_push_tokens" to "anon";

grant trigger on table "public"."user_push_tokens" to "anon";

grant truncate on table "public"."user_push_tokens" to "anon";

grant update on table "public"."user_push_tokens" to "anon";

grant delete on table "public"."user_push_tokens" to "authenticated";

grant insert on table "public"."user_push_tokens" to "authenticated";

grant references on table "public"."user_push_tokens" to "authenticated";

grant select on table "public"."user_push_tokens" to "authenticated";

grant trigger on table "public"."user_push_tokens" to "authenticated";

grant truncate on table "public"."user_push_tokens" to "authenticated";

grant update on table "public"."user_push_tokens" to "authenticated";

grant delete on table "public"."user_push_tokens" to "service_role";

grant insert on table "public"."user_push_tokens" to "service_role";

grant references on table "public"."user_push_tokens" to "service_role";

grant select on table "public"."user_push_tokens" to "service_role";

grant trigger on table "public"."user_push_tokens" to "service_role";

grant truncate on table "public"."user_push_tokens" to "service_role";

grant update on table "public"."user_push_tokens" to "service_role";


  create policy "Allow insert comments"
  on "public"."comments"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow read comments"
  on "public"."comments"
  as permissive
  for select
  to public
using (true);



  create policy "insert members"
  on "public"."conversation_members"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "members_insert"
  on "public"."conversation_members"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "members_select"
  on "public"."conversation_members"
  as permissive
  for select
  to authenticated
using (true);



  create policy "members_update"
  on "public"."conversation_members"
  as permissive
  for update
  to authenticated
using (true);



  create policy "view members"
  on "public"."conversation_members"
  as permissive
  for select
  to authenticated
using (true);



  create policy "create conversations"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "view conversations"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Anyone can view follows"
  on "public"."follows"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can create their own follows"
  on "public"."follows"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = follower_id));



  create policy "Users can delete their own follows"
  on "public"."follows"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = follower_id));



  create policy "Allow delete likes"
  on "public"."likes"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow users to delete own like"
  on "public"."likes"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow users to like"
  on "public"."likes"
  as permissive
  for insert
  to public
with check (true);



  create policy "insert notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((auth.uid() = sender_id));



  create policy "read own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((receiver_id = auth.uid()));



  create policy "Anyone can read posts"
  on "public"."posts"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can view posts"
  on "public"."posts"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can insert posts"
  on "public"."posts"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Authenticated users can update posts"
  on "public"."posts"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Users can delete own posts"
  on "public"."posts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete their own posts"
  on "public"."posts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "allow_authenticated_update_posts"
  on "public"."posts"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "insert posts"
  on "public"."posts"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "read posts"
  on "public"."posts"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can view profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Select own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can delete own profile"
  on "public"."profiles"
  as permissive
  for delete
  to public
using ((auth.uid() = id));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can read own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Users can insert own token"
  on "public"."user_push_tokens"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can update own token"
  on "public"."user_push_tokens"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can view own token"
  on "public"."user_push_tokens"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));


CREATE TRIGGER comments_count_trigger BEFORE INSERT OR UPDATE OF comments ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

/* CREATE TRIGGER "post-events" AFTER INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://ukghwpkdlsqgwbjhmezy.supabase.co/functions/v1/bright-task', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2h3cGtkbHNxZ3diamhtZXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDM1MiwiZXhwIjoyMDk0MzI2MzUyfQ.v79uMh5rQhPZn8HISQctkyfcl5vWOWBuJEOXUtzF9GU"}', '{}', '5000');
 */
/* CREATE TRIGGER "profile-events" AFTER INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://ukghwpkdlsqgwbjhmezy.supabase.co/functions/v1/bright-task', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2h3cGtkbHNxZ3diamhtZXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDM1MiwiZXhwIjoyMDk0MzI2MzUyfQ.v79uMh5rQhPZn8HISQctkyfcl5vWOWBuJEOXUtzF9GU"}', '{}', '5000');
 */
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER create_profile_after_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Authenticated users can delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'post-images'::text));



  create policy "Authenticated users can update profile images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'profile-images'::text));



  create policy "Authenticated users can upload profile images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'profile-images'::text));



  create policy "Authenticated users can upload"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'post-images'::text));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);



  create policy "Public can view profile images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-images'::text));



  create policy "Public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'post-images'::text));



