
DROP POLICY "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiries" ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) > 0
    AND char_length(email) > 2
    AND char_length(message) > 0
  );

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
