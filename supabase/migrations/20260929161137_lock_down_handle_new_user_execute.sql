-- handle_new_user is only ever invoked by the on_auth_user_created trigger.
-- Revoke direct EXECUTE so it isn't callable as a public RPC endpoint
-- (addresses the anon/authenticated SECURITY DEFINER advisor findings).
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
