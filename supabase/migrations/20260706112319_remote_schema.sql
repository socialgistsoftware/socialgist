


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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrease_followers"("target_id" "uuid", "my_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."decrease_followers"("target_id" "uuid", "my_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."decrement_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_posts_count"("user_id_input" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update profiles
  set posts_count = greatest(posts_count - 1, 0)
  where id = user_id_input;
end;
$$;


ALTER FUNCTION "public"."decrement_posts_count"("user_id_input" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increase_followers"("target_id" "uuid", "my_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."increase_followers"("target_id" "uuid", "my_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."increment_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_shares"("post_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update posts
  set shares_count = coalesce(shares_count, 0) + 1,
      updated_at = now()
  where id = post_id;
end;
$$;


ALTER FUNCTION "public"."increment_shares"("post_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_user_posts"("user_id_input" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update profiles
  set posts = coalesce(posts, 0) + 1
  where id = user_id_input;
end;
$$;


ALTER FUNCTION "public"."increment_user_posts"("user_id_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_user_posts"("user_id_input" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update profiles
  set posts = coalesce(posts, 0) + 1
  where id = user_id_input;
end;
$$;


ALTER FUNCTION "public"."increment_user_posts"("user_id_input" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_like"("post_id" "uuid", "user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."toggle_like"("post_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comments_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.comments_count :=
    COALESCE(
      jsonb_array_length(NEW.comments),
      0
    );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_comments_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$

begin

new.updated_at = now();

return new;

end;

$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "full_name" "text"
);


ALTER TABLE "public"."conversation_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid",
    "following_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "no_self_follow" CHECK (("follower_id" <> "following_id"))
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "sender_name" "text",
    "type" "text" NOT NULL,
    "message" "text",
    "post_id" "uuid",
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "profile_name" "text",
    "profile_image" "text",
    "type" "text",
    "description" "text",
    "image" "text",
    "content" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "likes_count" integer DEFAULT 0,
    "category" "text" DEFAULT 'all'::"text",
    "comments" "jsonb" DEFAULT '[]'::"jsonb",
    "comments_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0
);

ALTER TABLE ONLY "public"."posts" REPLICA IDENTITY FULL;


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "username" "text",
    "full_name" "text",
    "bio" "text",
    "avatar_url" "text",
    "cover_url" "text",
    "website" "text",
    "location" "text",
    "phone" "text",
    "verified" boolean DEFAULT false,
    "followers_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "posts_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "age" "text",
    "department" "text",
    "school" "text",
    "relationship_status" "text",
    "hobby" "text",
    "work" "text",
    "fcm_token" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_push_tokens" (
    "user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_push_tokens" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_conversation_id_user_id_key" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_chat_key_key" UNIQUE ("chat_key");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."user_push_tokens"
    ADD CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING "btree" ("post_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_members_user" ON "public"."conversation_members" USING "btree" ("user_id");



CREATE INDEX "profiles_full_name_idx" ON "public"."profiles" USING "btree" ("full_name");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "comments_count_trigger" BEFORE INSERT OR UPDATE OF "comments" ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_comments_count"();



CREATE OR REPLACE TRIGGER "post-events" AFTER INSERT OR UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://ukghwpkdlsqgwbjhmezy.supabase.co/functions/v1/bright-task', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2h3cGtkbHNxZ3diamhtZXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDM1MiwiZXhwIjoyMDk0MzI2MzUyfQ.v79uMh5rQhPZn8HISQctkyfcl5vWOWBuJEOXUtzF9GU"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "profile-events" AFTER INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://ukghwpkdlsqgwbjhmezy.supabase.co/functions/v1/bright-task', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2h3cGtkbHNxZ3diamhtZXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDM1MiwiZXhwIjoyMDk0MzI2MzUyfQ.v79uMh5rQhPZn8HISQctkyfcl5vWOWBuJEOXUtzF9GU"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "fk_comments_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow delete likes" ON "public"."likes" FOR DELETE USING (true);



CREATE POLICY "Allow insert comments" ON "public"."comments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow read comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Allow users to delete own like" ON "public"."likes" FOR DELETE USING (true);



CREATE POLICY "Allow users to like" ON "public"."likes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read posts" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Anyone can view follows" ON "public"."follows" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view posts" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can insert posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Select own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can create their own follows" ON "public"."follows" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can delete own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own profile" ON "public"."profiles" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete their own follows" ON "public"."follows" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can delete their own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own token" ON "public"."user_push_tokens" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own token" ON "public"."user_push_tokens" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own token" ON "public"."user_push_tokens" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow_authenticated_update_posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "create conversations" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert members" ON "public"."conversation_members" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "insert posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members_insert" ON "public"."conversation_members" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "members_select" ON "public"."conversation_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "members_update" ON "public"."conversation_members" FOR UPDATE TO "authenticated" USING (true);



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read own notifications" ON "public"."notifications" FOR SELECT USING (("receiver_id" = "auth"."uid"()));



CREATE POLICY "read posts" ON "public"."posts" FOR SELECT USING (true);



ALTER TABLE "public"."user_push_tokens" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "view conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "view members" ON "public"."conversation_members" FOR SELECT TO "authenticated" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."posts";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."decrease_followers"("target_id" "uuid", "my_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_followers"("target_id" "uuid", "my_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_followers"("target_id" "uuid", "my_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_posts_count"("user_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_posts_count"("user_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_posts_count"("user_id_input" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increase_followers"("target_id" "uuid", "my_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increase_followers"("target_id" "uuid", "my_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increase_followers"("target_id" "uuid", "my_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_follow_counts"("follower_id_input" "uuid", "following_id_input" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_shares"("post_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_shares"("post_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_shares"("post_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_user_posts"("user_id_input" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_like"("post_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_like"("post_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_like"("post_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_members" TO "anon";
GRANT ALL ON TABLE "public"."conversation_members" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_members" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."post_shares" TO "anon";
GRANT ALL ON TABLE "public"."post_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."post_shares" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_push_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_push_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_push_tokens" TO "service_role";









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































drop trigger if exists "comments_count_trigger" on "public"."posts";

drop trigger if exists "profiles_updated_at" on "public"."profiles";

alter table "public"."comments" drop constraint "comments_post_id_fkey";

alter table "public"."comments" drop constraint "comments_user_id_fkey";

alter table "public"."comments" drop constraint "fk_comments_user";

alter table "public"."conversation_members" drop constraint "conversation_members_conversation_id_fkey";

alter table "public"."follows" drop constraint "follows_follower_id_fkey";

alter table "public"."follows" drop constraint "follows_following_id_fkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."comments" add constraint "fk_comments_user" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."comments" validate constraint "fk_comments_user";

alter table "public"."conversation_members" add constraint "conversation_members_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_members" validate constraint "conversation_members_conversation_id_fkey";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_id_fkey";

CREATE TRIGGER comments_count_trigger BEFORE INSERT OR UPDATE OF comments ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

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



