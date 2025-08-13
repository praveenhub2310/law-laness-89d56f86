-- Remove any existing demo users first if they exist
DELETE FROM auth.users WHERE email IN ('admin@akralegal.com', 'lawyer@akralegal.com', 'firm@akralegal.com', 'client@akralegal.com');

-- Create the enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('super_admin', 'advocate', 'company', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the trigger function exists and works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client'::public.user_role)
  );
  
  -- Create role-specific records
  IF (NEW.raw_user_meta_data ->> 'role') = 'company' THEN
    INSERT INTO public.companies (id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Company'));
  ELSIF (NEW.raw_user_meta_data ->> 'role') = 'advocate' THEN
    INSERT INTO public.advocates (id, bar_number)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'bar_number', 'BAR123'));
  ELSIF (NEW.raw_user_meta_data ->> 'role') = 'client' THEN
    INSERT INTO public.clients (id, client_type)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'client_type', 'individual'));
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();