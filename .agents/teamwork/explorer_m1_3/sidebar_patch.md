# Sidebar Patch Specification: AdminSidebar Profile Greeting Link

**Target File**: `src/app/admin/(dashboard)/components/AdminSidebar.tsx`  
**Purpose**: Connect the user greeting card in `AdminSidebar` to `/admin/profile` with interactive hover transition, ring highlight when active, and accessible cursor pointer, matching the reference HCMUTE implementation (`app/components/admin-layout/user-sidebar.tsx:480`).

---

## 1. Description of Changes

1. **Active Route Detection**:
   - Add `/admin/profile` to candidate routes in `activeHref` memo.
   - Compute `isProfileActive` boolean flag checking if `pathname === "/admin/profile"` or `pathname.startsWith("/admin/profile/")`.

2. **Wrap Greeting Card in `<Link href="/admin/profile">`**:
   - Convert outer greeting card `<div>` (lines ~292–353) into Next.js `<Link href="/admin/profile">`.
   - Add `prefetch={true}` and `onClick={handleItemClick}` for smooth scrolling.
   - Replace `cursor-default` with `cursor-pointer`.
   - Add dynamic ring and shadow classes when `isProfileActive` is true:
     `"ring-2 ring-white/50 bg-white/15 backdrop-blur-md shadow-md"`
     and on hover:
     `"hover:border-white/35 hover:shadow-md active:scale-[0.99]"`.

3. **Chevron Hover & Active Transition**:
   - When `isProfileActive` is true: Chevron circular badge is permanently visible (`opacity-100`) with glassmorphism ring.
   - When not active: Badge reveals on hover via `group-hover/greeting-card:opacity-100 group-hover/greeting-card:translate-x-0`.

4. **Zero Sparkle Icons**:
   - Retains existing Lucide icons (`ChevronRight`, `AvatarFallback`). No sparkle icons added.

---

## 2. Diff Patch

```diff
--- a/src/app/admin/(dashboard)/components/AdminSidebar.tsx
+++ b/src/app/admin/(dashboard)/components/AdminSidebar.tsx
@@ -172,6 +172,7 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
     const candidates = [
       ...quickNavItems.map((item) => item.href),
       ...sidebarMenuGroups.flatMap((group) => group.items.map((item) => item.href)),
+      "/admin/profile",
     ]
       .map(normalizeHref)
       .filter((href) => href !== "/admin")
@@ -183,6 +184,8 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
   }, [pathname]);
 
   const isActive = (href: string) => normalizeHref(href) === activeHref;
+  const isProfileActive =
+    pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");
 
   const getUserInitials = () => {
     const rawName = user?.name || "Admin";
@@ -291,7 +294,16 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
       {state !== "collapsed" && (
         <div className="px-2 pt-4 pb-2 shrink-0 select-none">
-          <div
-            className="block relative overflow-hidden rounded-2xl text-white py-4.5 px-3.5 min-h-[92px] shadow-sm border border-white/20 bg-primary/20 backdrop-blur-md transition-all duration-200 group/greeting-card cursor-default"
-          >
+          <Link
+            href="/admin/profile"
+            prefetch={true}
+            onClick={handleItemClick}
+            className={cn(
+              "block relative overflow-hidden rounded-2xl text-white py-4.5 px-3.5 min-h-[92px] shadow-sm border border-white/20 bg-primary/20 backdrop-blur-md transition-all duration-200 group/greeting-card cursor-pointer",
+              isProfileActive
+                ? "ring-2 ring-white/50 bg-white/15 backdrop-blur-md shadow-md"
+                : "hover:border-white/35 hover:shadow-md active:scale-[0.99]"
+            )}
+            title="View Profile"
+          >
             {/* Background Image Asset */}
             <div className="absolute inset-0 select-none pointer-events-none">
@@ -323,7 +335,7 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
                     <p className="text-[11.5px] font-medium text-white/80 leading-tight drop-shadow-xs">
                       {greeting}
                     </p>
-                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-tight text-white truncate mt-0.5 drop-shadow-xs">
+                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-tight text-white truncate mt-0.5 drop-shadow-xs group-hover/greeting-card:text-white transition-colors">
                       {displayName}
                     </p>
                   </div>
@@ -331,7 +343,12 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
                 <div
-                  className="size-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs self-center opacity-0 translate-x-1 group-hover/greeting-card:opacity-100 group-hover/greeting-card:translate-x-0 bg-white/20 backdrop-blur-md border-white/35 text-white"
+                  className={cn(
+                    "size-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs self-center",
+                    isProfileActive
+                      ? "opacity-100 bg-white/30 backdrop-blur-md border-white/55 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] ring-2 ring-white/35"
+                      : "opacity-0 translate-x-1 group-hover/greeting-card:opacity-100 group-hover/greeting-card:translate-x-0 bg-white/20 backdrop-blur-md border-white/35 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover/greeting-card:bg-white/30 group-hover/greeting-card:border-white/50"
+                  )}
                   aria-hidden="true"
                 >
                   <ChevronRight className="size-4 stroke-[2.4] shrink-0" />
                 </div>
               </div>
@@ -351,6 +368,6 @@ export function AdminSidebar({ user }: AdminSidebarProps) {
               </div>
             </div>
-          </div>
+          </Link>
         </div>
       )}
```
