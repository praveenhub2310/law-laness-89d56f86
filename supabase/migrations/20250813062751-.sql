-- Drop and recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with proper error handling
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
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'client'::user_role)
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();