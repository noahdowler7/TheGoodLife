# Phase 6 - End-to-End Integration Test Checklist

## Setup Complete ✅
- Backend running: http://localhost:8000
- Frontend running: http://localhost:5175
- CORS configured for frontend port
- API client configured correctly

## Browser Test Instructions

Open **http://localhost:5175** in your browser and complete the following test journey:

### 1. Auth Flow
- [ ] Auth screen appears with email input
- [ ] Enter email: `test@example.com`
- [ ] Click "Send Magic Link"
- [ ] Copy the magic token from response (look in browser console or network tab)
- [ ] Paste token in verify field and click verify
- [ ] Redirected past auth gate
- [ ] Token stored in localStorage as `thegoodlife_token`

**Expected:** Successfully authenticated and redirected to main app

### 2. Data Migration (if localStorage data exists)
- [ ] Migration prompt appears if old localStorage data found
- [ ] Test "Import" → data synced to backend
- [ ] OR test "Skip" → continue without migration

**Expected:** Migration completes without errors

### 3. Onboarding Flow
- [ ] Welcome screen appears
- [ ] Complete all onboarding steps
- [ ] Settings saved to backend

**Expected:** Onboarding completes, redirected to Dashboard

### 4. Dashboard
- [ ] Capitals display with correct colors and labels
- [ ] Scripture/devotional content shows
- [ ] No console errors

**Expected:** Dashboard loads cleanly with all widgets

### 5. Today Page (`/today`)
- [ ] Navigate to Today view
- [ ] See list of disciplines by capital
- [ ] Toggle some disciplines on/off
- [ ] Reload page → toggles persist
- [ ] Check backend: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/investments/today`

**Expected:** Discipline tracking works and persists

### 6. Ratings
- [ ] Rate each capital (1-5 scale)
- [ ] Save ratings
- [ ] Reload page → ratings persist
- [ ] Check backend: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/ratings/2026-03-31`

**Expected:** Ratings save and load correctly

### 7. Reflections
- [ ] Navigate to Reflections
- [ ] Write devotional reflection
- [ ] Write capital-specific reflections
- [ ] Save reflections
- [ ] Reload → reflections persist

**Expected:** Reflection text saves and loads

### 8. Calendar/Events
- [ ] Navigate to Calendar
- [ ] Create a new event
- [ ] Event appears on calendar
- [ ] Edit event
- [ ] Delete event

**Expected:** Full event CRUD works

### 9. Fasting
- [ ] Navigate to Fasting tracker
- [ ] Start a new fast
- [ ] Set fast type and times
- [ ] Fast appears in list
- [ ] Mark fast as complete

**Expected:** Fasting tracking works

### 10. Settings
- [ ] Navigate to Settings
- [ ] Change theme (light/dark)
- [ ] Toggle capital visibility
- [ ] Save settings
- [ ] Reload → settings persist

**Expected:** Settings save to backend and apply

### 11. Analytics/Week View
- [ ] Navigate to Week view (`/week`)
- [ ] See weekly completion stats
- [ ] See average ratings by capital
- [ ] Verify data matches what was tracked

**Expected:** Analytics display correct aggregated data

### 12. Sync Test
- [ ] Track data in app
- [ ] Open browser console
- [ ] Run: `await fetch('http://localhost:8000/api/v1/sync/pull', {headers: {Authorization: 'Bearer ' + localStorage.getItem('thegoodlife_token')}}).then(r => r.json())`
- [ ] Verify all tracked data appears in response

**Expected:** Sync pull returns all user data

## Common Issues to Watch For

### CORS Errors
- Check browser console for CORS errors
- Verify backend CORS includes frontend port (5175)
- Current config: `http://localhost:5173, 5174, 5175`

### API Call Failures
- Open Network tab in browser DevTools
- Check all API calls return 200 (or expected status)
- Verify API base URL: http://localhost:8000

### Data Format Mismatches
- Frontend sends camelCase (e.g., `capitalId`)
- Backend expects snake_case (e.g., `capital_id`)
- Check request/response bodies in Network tab

### Auth Token Issues
- Token stored as: `thegoodlife_token` in localStorage
- Token format: `Bearer <jwt>`
- Check Authorization header in Network tab

### Console Errors
- Open browser console (F12)
- Watch for JavaScript errors
- Watch for React errors/warnings

## Success Criteria

All checkboxes above completed with:
- ✅ No CORS errors
- ✅ No 401/403 auth errors
- ✅ No 500 backend errors
- ✅ Data persists across page refreshes
- ✅ No console errors during normal usage

## Quick Debug Commands

```bash
# Check backend health
curl http://localhost:8000/api/v1/health

# Get auth token manually
curl -X POST http://localhost:8000/api/v1/auth/magic-link \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'

# Verify token
curl -X POST 'http://localhost:8000/api/v1/auth/verify?token=<MAGIC_TOKEN>'

# Test authenticated endpoint
curl -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  http://localhost:8000/api/v1/users/me

# Check backend logs
tail -f /private/tmp/claude-501/-Users-macbook-Project-AI-PA/tasks/bafacd3.output

# Check frontend logs
tail -f /private/tmp/claude-501/-Users-macbook-Project-AI-PA/tasks/b2d3eae.output
```

---

**When complete:** All features work end-to-end with no errors → Phase 6 COMPLETE ✅
