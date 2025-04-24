# Splitwise Integration Documentation

**Version:** 1.0
**Date:** 2025-04-24

## 1. Overview / Briefer

This integration connects a WithMe.travel trip to a Splitwise group, enabling users to track shared expenses and view simplified balances directly within the trip's Budget tab. It leverages Splitwise's calculation engine for managing group finances.

**Core Flows:**

*   **Authentication:** Uses OAuth 2.0. Users connect via a button, authorize on Splitwise, and are redirected back. Tokens are securely stored in `splitwise_connections` and automatically refreshed.
*   **Trip Linking:** Authenticated users can link a trip to one of their existing Splitwise groups via a dropdown. The link is stored by setting the `splitwise_group_id` in the `trips` database table.
*   **Expense Display:** Fetches and displays expenses from the linked Splitwise group using the `GET /get_expenses` endpoint.
*   **Settlement Display:** Fetches and displays simplified debts ("Settle Up" information) using the `simplified_debts` array from the `GET /get_group/{id}` endpoint response.
*   **Unlinking:** Allows users to remove the association between the trip and the Splitwise group.

**Key Components:**

*   **Backend:** `lib/services/splitwise.ts` (handles API calls, auth, DB interactions), `/api/splitwise/*` (route handlers).
*   **Frontend:** `BudgetTab`, `SplitwiseConnect`, `SplitwiseExpenses`, `SplitwiseSettleUp`.
*   **Database:** `splitwise_connections` table for tokens, `splitwise_group_id` column in `trips` table.

---

## 2. Extension Ideas & Prioritization

Here are potential ways to extend the current Splitwise integration:

### Expense Management

1.  **Create Expenses:** Allow adding expenses within WMT that push to Splitwise.
    *   **Proximity:** Medium (Requires new UI/form, backend logic for `POST /create_expense`).
    *   **Priority:** High (Core functionality extension).
2.  **Update Expenses:** Allow editing synced Splitwise expenses.
    *   **Proximity:** Medium (Requires UI for editing, backend logic for `POST /update_expense/{id}`).
    *   **Priority:** Medium (Useful, but creation/viewing is higher).
3.  **Delete Expenses:** Allow deleting synced Splitwise expenses.
    *   **Proximity:** Medium (Requires UI confirmation, backend logic for `POST /delete_expense/{id}`).
    *   **Priority:** Medium.
4.  **Advanced Splitting:** Implement various split types (exact, percent, shares) when creating expenses.
    *   **Proximity:** Medium/Far (Requires complex UI matching Splitwise, significant backend logic for `POST /create_expense` `users` array).
    *   **Priority:** Medium (Increases power but adds complexity).
5.  **View Expense Details:** Show full details of a selected Splitwise expense.
    *   **Proximity:** Medium (Requires UI modal/view, backend call to `GET /get_expense/{id}`).
    *   **Priority:** Medium.
6.  **Categorization:** Use Splitwise categories when creating expenses.
    *   **Proximity:** Medium (Requires fetching categories `GET /get_categories`, adding selector to creation UI, backend logic).
    *   **Priority:** High (Important for organization).
7.  **Currency Support:** Allow expense creation in different currencies.
    *   **Proximity:** Medium (Requires fetching currencies `GET /get_currencies`, adding selector, backend handling).
    *   **Priority:** Medium (Depends on user travel patterns).
8.  **Date Selection:** Allow specifying the exact date for created/edited expenses.
    *   **Proximity:** Near (Add date picker to forms, backend passes `date` parameter).
    *   **Priority:** High (Basic requirement).
9.  **Expense Filtering/Searching:** Add frontend filtering for displayed Splitwise expenses.
    *   **Proximity:** Near/Medium (Frontend state management, UI elements. Backend filtering if list is large).
    *   **Priority:** Medium.
10. **Expense Undelete:** Option to restore deleted expenses.
    *   **Proximity:** Medium (Requires tracking deleted IDs, UI button, backend call to `POST /restore_expense/{id}`).
    *   **Priority:** Low.
11. **Bi-directional Sync:** Sync WMT native budget items *to* Splitwise.
    *   **Proximity:** Far (Complex logic to map items, avoid duplicates, handle updates).
    *   **Priority:** Low/Medium (Potential for confusion).
12. **Import to Native Budget:** Import Splitwise expenses *into* WMT native budget.
    *   **Proximity:** Medium (Requires UI for selection, backend logic to create WMT budget items).
    *   **Priority:** Medium.
13. **Receipt Attachment:** Link receipt images/URLs.
    *   **Proximity:** Far (Splitwise API doesn't seem to support this directly. Would require WMT-side storage linked to SW expense ID).
    *   **Priority:** Low.
14. **Recurring Expenses:** Interface for recurring expenses.
    *   **Proximity:** Far (Splitwise API doesn't explicitly document this).
    *   **Priority:** Low.

### Group & Member Management

15. **Create Splitwise Group:** Option to create a *new* Splitwise group from WMT.
    *   **Proximity:** Medium (Requires UI, backend call to `POST /create_group`).
    *   **Priority:** Medium (Convenience feature).
16. **Auto-Add Members:** Invite/add trip members to the linked Splitwise group.
    *   **Proximity:** Medium/Far (Requires mapping WMT users to SW users (email?), logic for `POST /add_user_to_group`, handling errors/existing members).
    *   **Priority:** High (Major convenience).
17. **Auto-Remove Members:** Remove users from SW group when removed from WMT trip.
    *   **Proximity:** Medium/Far (Similar complexity to adding, requires `POST /remove_user_from_group`).
    *   **Priority:** Medium.
18. **Sync Members Button:** Manual button to reconcile members.
    *   **Proximity:** Medium (Combines logic of add/remove).
    *   **Priority:** Medium.
19. **View Group Members:** Display linked Splitwise group members in WMT.
    *   **Proximity:** Near (Data available in `GET /get_group/{id}` response, which is already fetched for settle up).
    *   **Priority:** Medium.
20. **Display Group Whiteboard:** Show Splitwise group whiteboard content.
    *   **Proximity:** Near (Data available in `GET /get_group/{id}` response).
    *   **Priority:** Low.

### Friend Integration

21. **Suggest Shared Groups:** Suggest linking groups shared with WMT trip members who are also SW friends.
    *   **Proximity:** Far (Requires fetching SW friends `GET /get_friends`, complex matching logic).
    *   **Priority:** Low.
22. **Add Splitwise Friends:** Allow adding SW friends from WMT.
    *   **Proximity:** Medium (Requires UI, backend call to `POST /add_friend`).
    *   **Priority:** Low.
23. **View Friend Balances:** Show balances with specific friends on the trip.
    *   **Proximity:** Medium (Requires fetching friend details `GET /get_friend/{id}`).
    *   **Priority:** Low.
24. **Import Friends:** Import SW friends to suggest inviting to WMT trip.
    *   **Proximity:** Medium (Requires fetching `GET /get_friends`, UI for suggestions).
    *   **Priority:** Low/Medium (Could help onboarding).

### Comments & Notifications

25. **View Expense Comments:** Display comments on Splitwise expenses.
    *   **Proximity:** Medium (Requires UI integration, backend call to `GET /get_comments`).
    *   **Priority:** Low/Medium.
26. **Add Expense Comments:** Allow adding comments from WMT.
    *   **Proximity:** Medium (Requires UI input, backend call to `POST /create_comment`).
    *   **Priority:** Low/Medium.
27. **Delete Expense Comments:** Allow deleting own comments.
    *   **Proximity:** Medium (Requires UI button, backend call to `POST /delete_comment/{id}`).
    *   **Priority:** Low.
28. **In-App Notifications:** Display relevant Splitwise notifications in WMT.
    *   **Proximity:** Medium/Far (Requires polling `GET /get_notifications`, integrating with WMT notification system).
    *   **Priority:** Low/Medium.

### UI/UX & Data Display

29. **Dashboard Widget:** Summarize linked SW group balances on WMT dashboard.
    *   **Proximity:** Medium (Requires new component, data fetching logic).
    *   **Priority:** Medium.
30. **Profile Integration:** Show SW connection status on WMT profile.
    *   **Proximity:** Near (Requires checking `splitwise_connections` table for user).
    *   **Priority:** Low.
31. **Visualizations:** Charts/graphs for SW expense data.
    *   **Proximity:** Medium (Requires charting library, data processing).
    *   **Priority:** Medium.
32. **Settle Up Links:** Direct links to payment apps based on simplified debts.
    *   **Proximity:** Medium/Far (Requires identifying payment patterns/deep links, may not be reliable).
    *   **Priority:** Medium.
33. **Detailed Balances:** Show full per-user balances from the group.
    *   **Proximity:** Near (Data available in `GET /get_group/{id}` response).
    *   **Priority:** High (Core information).
34. **Currency Conversion:** Display totals in user's preferred currency.
    *   **Proximity:** Medium (Requires user preference setting, currency rate lookup/API).
    *   **Priority:** Medium.
35. **Customizable Refresh:** User setting for auto-refresh interval.
    *   **Proximity:** Medium (Requires UI settings, modifying polling logic).
    *   **Priority:** Low.
36. **Loading/Empty States:** Improve loading/empty state UI.
    *   **Proximity:** Near (Frontend UI tweaks).
    *   **Priority:** Medium.
37. **Enhanced Error Handling:** More specific user feedback for errors.
    *   **Proximity:** Near/Medium (Refining error messages in frontend/backend).
    *   **Priority:** High.

### Advanced & Automation

38. **Webhook Integration:** Real-time updates via Splitwise webhooks.
    *   **Proximity:** Far (Splitwise API docs do not mention webhooks).
    *   **Priority:** Medium (If available, would be better than polling).
39. **Auto-Linking Suggestion:** Suggest SW groups based on trip name/members.
    *   **Proximity:** Far (Complex heuristics, potential for inaccuracies).
    *   **Priority:** Low.
40. **Bulk Operations:** Bulk expense import/creation.
    *   **Proximity:** Far (Requires significant UI/backend for bulk handling).
    *   **Priority:** Low/Medium.
41. **Itinerary Integration:** Link expenses to itinerary items.
    *   **Proximity:** Medium (Requires schema changes/linking table, UI for association).
    *   **Priority:** Medium.
42. **Permissions Granularity:** WMT admin control over member access to SW data within WMT.
    *   **Proximity:** Medium (Requires WMT-side permission checks).
    *   **Priority:** Low.
43. **Trip Template Integration:** Default SW group naming/linking for templates.
    *   **Proximity:** Medium (Requires extending template logic).
    *   **Priority:** Low.
44. **Offline Caching:** Cache SW data for offline viewing.
    *   **Proximity:** Medium (Requires frontend caching strategy).
    *   **Priority:** Low.
45. **Data Export:** Export trip-related SW data as CSV.
    *   **Proximity:** Medium (Requires data formatting and CSV generation logic).
    *   **Priority:** Low/Medium.

### Miscellaneous

46. **User Settings:** Dedicated page/section for managing SW connection.
    *   **Proximity:** Medium (Requires new settings UI page/section).
    *   **Priority:** Medium.
47. **Gamification:** Badges for settling up.
    *   **Proximity:** Far (Requires tracking settlement status, gamification engine).
    *   **Priority:** Low.
48. **AI Spending Analysis:** AI insights on SW spending data.
    *   **Proximity:** Far (Requires AI/ML integration).
    *   **Priority:** Low.
49. **Update User Profile:** Sync profile info from Splitwise.
    *   **Proximity:** Medium (Requires UI consent, backend logic for `GET /get_current_user` and `POST /update_user/{id}`).
    *   **Priority:** Low.
50. **Support Multiple Linked Groups:** Allow >1 SW group per trip.
    *   **Proximity:** Far (Significant change to linking logic, UI, data display).
    *   **Priority:** Low.

## 3. API Endpoints for Extension Ideas

This section outlines the corresponding Splitwise API endpoints that support the extension ideas described above. All endpoints require OAuth2.0 or API Key authentication as specified in the Splitwise API documentation.

### Expense Management

- **Create Expenses:** Use the `POST /create_expense` endpoint to add new expenses. [API Reference](https://dev.splitwise.com/#tag/expenses/paths/~1create_expense/post)
- **Update Expenses:** Use the `POST /update_expense/{id}` endpoint to modify existing expenses.
- **Delete Expenses:** Use the `POST /delete_expense/{id}` endpoint to remove expenses.
- **Advanced Splitting:** Utilize the `POST /create_expense` endpoint with configurations for exact, percentage, or share-based splits.
- **View Expense Details:** Use the `GET /get_expense/{id}` endpoint to fetch detailed expense information.
- **Categorization:** Retrieve available categories via `GET /get_categories` to assist in organizing expenses.
- **Currency Support:** Retrieve supported currencies with `GET /get_currencies` for expense submissions.
- **Date Selection:** Include date parameters in expense creation or updates as required.
- **Expense Filtering/Searching:** Leverage query parameters with `GET /get_expenses` to filter expenses. [API Reference](https://dev.splitwise.com/#tag/expenses/paths/~1get_expenses/get)
- **Expense Undelete:** Use the `POST /restore_expense/{id}` endpoint to restore deleted expenses.

### Group & Member Management

- **Create Splitwise Group:** Utilize the `POST /create_group` endpoint to form new groups.
- **Auto-Add Members:** Add users to a group via the `POST /add_user_to_group` endpoint.
- **Auto-Remove Members:** Remove users using the `POST /remove_user_from_group` endpoint.
- **Sync Members:** Combine the auto-add and auto-remove endpoints to reconcile group membership.
- **View Group Members:** Group details, including member lists, are available from `GET /get_group/{id}`.
- **Display Group Whiteboard:** If applicable, whiteboard content can be integrated from `GET /get_group/{id}`.

### Friend Integration

- **Suggest Shared Groups:** Use `GET /get_friends` to query friend lists and determine common groups.
- **Add Splitwise Friends:** Use the `POST /add_friend` endpoint to send friend requests.
- **View Friend Balances:** Retrieve friend balance details via `GET /get_friend/{id}`.
- **Import Friends:** Use the `GET /get_friends` endpoint to import friend data for group suggestions.

### Comments & Notifications

- **View Expense Comments:** (Assumed) Use a hypothetical `GET /get_expense_comments` endpoint to fetch comments associated with an expense.
- **Add Expense Comments:** Use the `POST /create_comment` endpoint to add a comment to an expense. [API Reference](https://dev.splitwise.com/#tag/comments/paths/~1create_comment/post)
- **Delete Expense Comments:** Remove a comment using the `POST /delete_comment/{id}` endpoint. [API Reference](https://dev.splitwise.com/#tag/comments/paths/~1delete_comment%2F{id}/post)
- **In-App Notifications:** Retrieve notifications through `GET /get_notifications`. [API Reference](https://dev.splitwise.com/#tag/notifications/paths/~1get_notifications/get)

### UI/UX & Data Display

- **Dashboard Widget & Detailed Balances:** Leverage data from `GET /get_group/{id}` to display comprehensive group and balance information.
- **Profile Integration:** Utilize user data from `GET /get_current_user` for profile displays.
- **Visualizations:** Base expense visualization data on `GET /get_expenses` endpoint.
- **Currency Conversion:** Use `GET /get_currencies` to support expense conversion and display in different currencies.

### Advanced & Automation

- **Webhook Integration:** Currently, Splitwise does not provide webhook endpoints.
- **Bulk Operations:** Bulk import/creation features are not directly supported by the Splitwise API.
- **Data Export:** No dedicated endpoint for CSV export exists; data must be aggregated from existing endpoints.

### Miscellaneous

- **User Settings & Profile Updates:** Retrieve and update user profiles using `GET /get_current_user` and `POST /update_user/{id}` endpoints.
- **Support for Multiple Linked Groups:** The current API does not support linking multiple groups per trip. 