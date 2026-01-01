# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e3]:
        - img [ref=e5]
        - generic [ref=e8]: Request failed with status code 401
  - generic [ref=e10]:
    - generic [ref=e11]:
      - img [ref=e13]
      - heading "Admin Portal" [level=1] [ref=e15]
      - paragraph [ref=e16]: Sign in to access the admin panel
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: Email
        - generic [ref=e21]:
          - img [ref=e22]
          - textbox "admin@example.com" [ref=e25]: admin@sajilokaam.com
      - generic [ref=e26]:
        - generic [ref=e27]: Password
        - generic [ref=e28]:
          - img [ref=e29]
          - textbox "••••••••" [ref=e32]: admin123
          - button [ref=e33] [cursor=pointer]:
            - img [ref=e34]
      - button "Sign In" [ref=e37] [cursor=pointer]
    - paragraph [ref=e38]: Restricted access. Authorized personnel only.
```