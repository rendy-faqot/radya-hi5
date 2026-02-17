# 👥 Team Members Configuration

The list of users who can receive Hi5s is managed through a JSON file.

## File Location

`src/lib/team-members.json`

## Format

Each team member must have:
- `id`: Unique identifier (any string, e.g., "user-001")
- `name`: Full name of the person
- `email`: Email address (used for notifications and user lookup)
- `department`: Department/team name (optional, for reference)

## Example

```json
[
  {
    "id": "user-001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering"
  },
  {
    "id": "user-002",
    "name": "Bob Smith",
    "email": "bob@example.com",
    "department": "Design"
  }
]
```

## How It Works

1. **User Selection**: When giving Hi5s, users select recipients from this JSON list
2. **Auto-Creation**: If a recipient doesn't exist in the database, they're automatically created when they receive their first Hi5
3. **Sign In**: Recipients can sign in with Google later to view their received Hi5s

## Updating the List

Simply edit `src/lib/team-members.json` and add, remove, or update team members. Changes take effect immediately (no server restart needed).

## Important Notes

- **Email Uniqueness**: Each email should be unique
- **ID Uniqueness**: Each `id` should be unique
- **Case Sensitivity**: Emails are case-sensitive (use lowercase)
- **Department**: Optional field, doesn't affect functionality

## Workflow

1. Add team member to `team-members.json`
2. Anyone can select them for Hi5s
3. When they receive their first Hi5, a user account is auto-created
4. They can sign in with Google to view their Hi5s

## Security

- This JSON file is server-side only (not exposed to clients)
- Emails are only used for notifications and user matching
- No sensitive information should be stored in this file
