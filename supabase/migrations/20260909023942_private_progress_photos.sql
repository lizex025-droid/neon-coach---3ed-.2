insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy progress_photos_owner on storage.objects for all to authenticated
using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false))
with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
