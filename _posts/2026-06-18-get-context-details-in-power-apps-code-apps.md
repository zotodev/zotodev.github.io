---
title: Get Context Details in Power Apps Code Apps
---

![](/assets/images/get-context-details-in-power-apps-code-apps/01-e89c0e10.png)

## 1. Create Custom Hook (useCurrentUser.ts)


```
import { useQuery } from '@tanstack/react-query';
import { getContext } from '@microsoft/power-apps/app';

export interface CurrentUser {
  fullName: string;
  objectId: string;
  userPrincipalName: string;
  tenantId: string;
}

export const useCurrentUser = () => {
  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const ctx = await getContext();
      return ctx.user;
    },
    staleTime: 1000 * 60 * 60,      // 1 hour
    gcTime: 1000 * 60 * 60 * 24,    // 24 hours
    retry: 1,
  });
};
```


## 2. Use it in Your Component


```
import { useCurrentUser } from '../hooks/useCurrentUser';

function UserHeader() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (isError || !user) {
    return <div style={{ color: 'red' }}>Failed to load user</div>;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px'
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{user.fullName}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {user.userPrincipalName}
        </div>
      </div>
    </div>
  );
}

export default UserHeader;
```


**Read more:**
[Official Microsoft Documentation - getContext() in Power Apps Code Apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/retrieve-context)
