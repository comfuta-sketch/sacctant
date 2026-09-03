CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT lower(email) INTO v_email FROM auth.users WHERE id = NEW.user_id;
    IF v_email IS DISTINCT FROM 'marcosmelo.advisory@gmail.com' THEN
      RAISE EXCEPTION 'Apenas o administrador principal pode ter o papel de admin.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_single_admin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_single_admin_trg ON public.user_roles;
CREATE TRIGGER enforce_single_admin_trg
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();

DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND ur.user_id NOT IN (
    SELECT id FROM auth.users WHERE lower(email) = 'marcosmelo.advisory@gmail.com'
  );