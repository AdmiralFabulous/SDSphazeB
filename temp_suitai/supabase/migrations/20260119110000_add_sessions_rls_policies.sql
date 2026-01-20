-- RLS Policies for sessions table
-- Task: DB-E01-S01-T04
-- Sessions can be accessed by their owner (via session ID) or by the linked user

-- Policy: Anyone can create a session (anonymous)
CREATE POLICY "Anyone can create session"
    ON public.sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Session owner can view (by session ID in JWT or user_id match)
CREATE POLICY "Session owner can view"
    ON public.sessions
    FOR SELECT
    USING (
        id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        OR user_id = auth.uid()
    );

-- Policy: Session owner can update
CREATE POLICY "Session owner can update"
    ON public.sessions
    FOR UPDATE
    USING (
        id::text = coalesce(current_setting('request.jwt.claim.session_id', true), '')
        OR user_id = auth.uid()
    );

-- Policy: Users can claim anonymous sessions
CREATE POLICY "Users can claim sessions"
    ON public.sessions
    FOR UPDATE
    USING (user_id IS NULL)  -- Only anonymous sessions
    WITH CHECK (user_id = auth.uid());  -- Can only claim for self

-- Service role bypass
CREATE POLICY "Service role full access sessions"
    ON public.sessions
    FOR ALL
    USING (auth.role() = 'service_role');
