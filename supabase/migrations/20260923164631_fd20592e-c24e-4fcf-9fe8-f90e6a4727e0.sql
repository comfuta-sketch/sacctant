DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
INSERT INTO public.profiles (id, nome, cpf, email)
SELECT u.id, u.raw_user_meta_data->>'nome', NULLIF(regexp_replace(coalesce(u.raw_user_meta_data->>'cpf',''),'\D','','g'),''), u.email
FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=u.id)
ON CONFLICT DO NOTHING;
UPDATE public.profiles p SET cpf = regexp_replace(u.raw_user_meta_data->>'cpf','\D','','g')
FROM auth.users u WHERE u.id=p.id AND p.cpf IS NULL AND coalesce(u.raw_user_meta_data->>'cpf','')<>'';