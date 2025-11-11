# Results Page Integration Testing Guide

## Pre-Test Setup

1. Ensure dev server is running: `npm run dev`
2. Ensure database is connected and seeded with test data
3. Complete an intake flow to generate a valid session ID

## Test Scenarios

### Scenario 1: Happy Path - Valid Results Display

**Steps:**
1. Complete intake flow from `/intake/step-1` through `/intake/step-4`
2. Submit final step and note the session ID
3. Wait for redirect to `/results/[id]`
4. Verify page loads without errors

**Expected Results:**
- ✅ Page loads within 2 seconds
- ✅ COI display shows formatted dollar amounts
- ✅ Confidence band displays low/medium/high values
- ✅ Top 3 cost drivers appear with hours wasted
- ✅ AI maturity level badge shows correct level (0-4)
- ✅ Progress bar reflects maturity percentage
- ✅ Quick wins cards display (minimum 3, maximum all available)
- ✅ Each card shows savings, complexity, and timeline
- ✅ CTA section displays with gradient background
- ✅ Both CTA buttons are clickable
- ✅ Complete quick wins list appears at bottom

**Data Validation:**
- Monthly COI matches API response
- Annual calculation = monthly × 12
- Maturity level label matches level number
- Quick wins are sorted by priority
- All dollar amounts use proper formatting (commas)

---

### Scenario 2: Loading State

**Steps:**
1. Navigate to `/results/[valid-id]` with network throttling enabled (Slow 3G)
2. Observe loading skeleton

**Expected Results:**
- ✅ Loading skeleton displays immediately
- ✅ No layout shift when actual content loads
- ✅ Skeleton matches final layout structure
- ✅ Animations are smooth (no jank)

---

### Scenario 3: Invalid Session ID

**Steps:**
1. Navigate to `/results/invalid-session-123`
2. Wait for page to load

**Expected Results:**
- ✅ 404 Not Found page displays
- ✅ Error icon appears (AlertCircle)
- ✅ Helpful error message explains issue
- ✅ "Start New Assessment" button links to `/intake`
- ✅ "Return to Home" button links to `/`

---

### Scenario 4: Mobile Responsiveness

**Steps:**
1. Open results page on valid session ID
2. Use Chrome DevTools device emulation
3. Test on iPhone SE (375px), iPhone 12 (390px), iPad (768px)

**Expected Results:**
- ✅ Header title wraps properly on small screens
- ✅ COI big number remains readable
- ✅ Quick wins cards stack vertically on mobile
- ✅ Grid becomes 2 columns on tablet, 3 on desktop
- ✅ CTA buttons stack vertically on mobile
- ✅ All text is readable without horizontal scroll
- ✅ Touch targets are minimum 44px × 44px

---

### Scenario 5: Dark Mode

**Steps:**
1. Load results page in light mode
2. Toggle system/browser to dark mode
3. Verify all components render correctly

**Expected Results:**
- ✅ Background gradient transitions smoothly
- ✅ Text remains readable (proper contrast)
- ✅ Cards have dark mode styling
- ✅ Gradient backgrounds adapt to dark theme
- ✅ Icons maintain visibility
- ✅ No white/black flash during transition

---

### Scenario 6: Data Edge Cases

**Test Cases:**

#### 6a: Very High COI (> $100k/month)
**Expected:**
- ✅ Number formats correctly with commas
- ✅ Layout doesn't break with large numbers
- ✅ Text remains within card boundaries

#### 6b: Very Low COI (< $1k/month)
**Expected:**
- ✅ Still displays compelling value
- ✅ Confidence band shows reasonable range
- ✅ Quick wins still prioritized correctly

#### 6c: Zero Maturity Level
**Expected:**
- ✅ "Not Started" badge displays
- ✅ Progress bar shows 0%
- ✅ Description explains current state
- ✅ No errors in console

#### 6d: Maximum Maturity Level (4)
**Expected:**
- ✅ "Leading" badge displays
- ✅ Progress bar shows 100%
- ✅ Messaging reflects advanced status

#### 6e: Only 1 Quick Win
**Expected:**
- ✅ Single card displays properly
- ✅ Grid layout adapts (doesn't look broken)
- ✅ Complete list section still renders

#### 6f: 10+ Quick Wins
**Expected:**
- ✅ Top 3 display in hero section
- ✅ All display in complete breakdown
- ✅ Page remains scrollable
- ✅ Performance stays smooth

---

### Scenario 7: Variant Testing (Future)

**Steps:**
1. Navigate to `/results/[id]?variant=b`
2. Verify Variant B loads (ops efficiency focus)
3. Navigate to `/results/[id]?variant=c`
4. Verify Variant C loads (growth focus)

**Expected Results:**
- ✅ URL parameter changes variant display
- ✅ Different messaging appears
- ✅ CTA copy updates accordingly
- ✅ Metrics emphasize different aspects

**Note:** This requires implementing variant switcher logic in page.tsx

---

### Scenario 8: Performance Testing

**Metrics to Check:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

**Tools:**
- Chrome Lighthouse
- WebPageTest.org
- Next.js built-in analytics

---

### Scenario 9: SEO & Meta Tags

**Steps:**
1. View page source on `/results/[id]`
2. Check meta tags in `<head>`

**Expected Results:**
- ✅ Title tag includes company name
- ✅ Meta description is compelling
- ✅ No index tag present (keep private)
- ✅ OG tags set for social sharing (if desired)

---

### Scenario 10: Analytics Events

**Steps:**
1. Open browser console
2. Load results page
3. Interact with various elements
4. Check network tab for analytics calls

**Expected Events:**
- ✅ `results_page_view` fires on load
- ✅ `coi_display_viewed` with amount
- ✅ `quick_win_card_clicked` on card interaction
- ✅ `cta_button_clicked` on CTA click
- ✅ All events include sessionId

**Note:** Requires analytics integration (PostHog/Mixpanel)

---

## Automated Testing

### Unit Tests (Jest + React Testing Library)

```typescript
// Example test structure
describe('Results Page', () => {
  it('renders COI display with formatted values', () => {})
  it('displays correct maturity level', () => {})
  it('shows top 3 quick wins', () => {})
  it('handles loading state', () => {})
  it('redirects on invalid ID', () => {})
})
```

### E2E Tests (Playwright)

```typescript
test('complete user journey from intake to results', async ({ page }) => {
  // Fill out intake form
  // Submit
  // Wait for redirect
  // Assert results page content
  // Click CTA button
  // Verify booking page loads
})
```

---

## Common Issues & Debugging

### Issue: "Cannot read property 'monthly' of undefined"
**Cause:** API response structure doesn't match expected format
**Fix:** Check API endpoint response shape, verify TypeScript types

### Issue: Quick wins not displaying
**Cause:** Empty array or missing data
**Fix:** Add fallback UI for no results case

### Issue: Styles not applying
**Cause:** Tailwind classes not recognized
**Fix:** Verify Tailwind config includes app directory

### Issue: Dark mode flashing
**Cause:** No theme detection on initial load
**Fix:** Use next-themes or similar for SSR dark mode

---

## Performance Optimization Checklist

- [ ] Images optimized (use Next.js Image component)
- [ ] Bundle size analyzed (`npm run build` check)
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] API response cached appropriately
- [ ] No console errors in production build
- [ ] Lighthouse score > 90 across all metrics

---

## Sign-Off Checklist

Before marking results page as complete:

- [ ] All 10 test scenarios pass
- [ ] Mobile responsive on all breakpoints
- [ ] Dark mode works perfectly
- [ ] TypeScript compiles with no errors
- [ ] ESLint shows no warnings
- [ ] Build succeeds with no errors
- [ ] Manual QA completed by 2+ team members
- [ ] Analytics events firing correctly
- [ ] Load time < 3 seconds on 3G
- [ ] Accessible (WCAG AA minimum)

---

## Next Steps After Testing

1. **Deploy to Staging:** Test with real data
2. **User Testing:** 5-10 real prospects
3. **A/B Test Setup:** Implement variant switcher
4. **Monitor Metrics:** Conversion rate, time on page
5. **Iterate:** Based on user feedback and data
