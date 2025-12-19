# 📊 Load Testing & Performance Optimization Report

## 1. Overview

This report documents the load testing process for the Chat Application backend. The goal was to validate system stability under concurrency, identify performance bottlenecks, and implement optimizations.

**Tools Used:**

- **k6:** For simulating concurrent user traffic.
- **Clinic.js Flame:** For profiling CPU usage and identifying "hot paths" in the Node.js application.
- **PostgreSQL (`pg_stat_statements`):** For analyzing raw database query performance.

---

## 2. Methodology & Execution

### Step 1: k6 Load Test

A script was created to simulate a realistic usage scenario:

- **Ramp-up:** 0 to 50 users.
- **Actions:** Login → Fetch Chat History → Send Text Messages.
- **Duration:** 3 minutes.

### Step 2: Profiling

The server was run using `clinic flame` while the k6 load test was active to capture a CPU flamegraph during peak load.

### Step 3: Database Analysis

To rule out the database as the bottleneck, `pg_stat_statements` was queried to find the slowest queries.

---

## 3. Findings

### ❌ The Problem (k6 Results)

### Full report:

```
█ TOTAL RESULTS

checks_total.......: 4225    22.884268/s
checks_succeeded...: 100.00% 4225 out of 4225
checks_failed......: 0.00%   0 out of 4225

✓ login successful
✓ read history status 200
✓ message sent status 201

CUSTOM
errors.........................: 0      0/s
login_duration.................: avg=181.176336 min=1.367179  med=75.966594  max=1784.164453 p(90)=523.725182 p(95)=729.56604
read_history_duration..........: avg=398.910421 min=68.617092 med=208.864211 max=2436.462331 p(90)=993.475636 p(95)=1225.664698
send_message_duration..........: avg=287.078899 min=11.213874 med=146.995002 max=2105.414582 p(90)=787.282377 p(95)=1031.254695

HTTP
http_req_duration..............: avg=288.26ms   min=1.36ms    med=141.79ms   max=2.43s       p(90)=790.31ms   p(95)=1.04s
{ expected_response:true }...: avg=288.26ms   min=1.36ms    med=141.79ms   max=2.43s       p(90)=790.31ms   p(95)=1.04s
http_req_failed................: 0.00%  0 out of 4225
http_reqs......................: 4225   22.884268/s

EXECUTION
iteration_duration.............: avg=7.47s      min=5.11s     med=7.32s      max=10.42s      p(90)=9.01s      p(95)=9.31s
iterations.....................: 845    4.576854/s
vus............................: 1      min=1         max=50
vus_max........................: 50     min=50        max=50

NETWORK
data_received..................: 14 MB  78 kB/s
data_sent......................: 1.4 MB 7.7 kB/s
```

The load test revealed unacceptable latency figures:

- **P95 Latency:** `1.04s` (Target: `<500ms`)
- **Max Latency:** Spikes up to `2.4s`.
- **Throughput:** Functional but sluggish.

### ✅ Database Health Check

Querying `pg_stat_statements` revealed that the database was **not** the bottleneck.
The heaviest queries (fetching `users_chats`) had a mean execution time of only **~3ms to 8ms**.

```sql
-- Top queries by execution time
"SELECT ... FROM users_chats WHERE user_id IN (...) OFFSET ..." -> 8.55ms
"SELECT ... FROM users_chats WHERE user_id IN (...) OFFSET ..." -> 7.74ms

```

_Conclusion: The DB is fast. The delay is happening in the application layer._

### 🔥 Flamegraph Analysis

### Flamegraph:

![flamegraph](https://i.postimg.cc/9CVsvNvr/flamegraph.png)

The Clinic.js flamegraph showed that approximately **70% of CPU time** was spent inside `/prisma/generated`.

This indicated a massive **Serialization/Hydration overhead**. The application was spending most of its time converting database rows into JavaScript objects.

---

## 4. Root Cause Analysis

The issue was traced to an inefficient Prisma query in `ChatService.getPaginatedMessages`.

**The Flawed Logic:**

```typescript
include: {
  user: {
    include: {
      userChat: {
        include: {
          role: true;
        }
      }
    }
  }
}
```

**Why it failed:** This caused an **Application-Side N+1 Issue**. For _every_ message fetched, Prisma was retrieving **ALL** chat memberships for that user. If a user was a member of 50 chats, the server fetched, hydrated, and stored 50 objects just to check the role for _one_ specific chat.

---

## 5. The Fix

The query was rewritten to use `select` with a strict `where` filter on the relation.

**Optimized Code:**

```typescript
const messages = await this.prismaService.message.findMany({
  where: whereCondition,
  include: {
    user: {
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        // ✅ FIX: Fetch ONLY the membership for the CURRENT chat
        userChat: {
          where: { chatId: chatId },
          take: 1,
          select: {
            role: { select: { name: true } },
          },
        },
      },
    },
  },
  // ...
});
```

### Final report:

```
█ TOTAL RESULTS

checks_total.......: 5145    27.837579/s
checks_succeeded...: 100.00% 5145 out of 5145
checks_failed......: 0.00%   0 out of 5145

✓ login successful
✓ read history status 200
✓ message sent status 201

CUSTOM
errors.........................: 0      0/s
login_duration.................: avg=46.888548 min=44.123682 med=45.906544 max=89.675931 p(90)=50.043102 p(95)=52.613751
read_history_duration..........: avg=4.542498  min=2.065781  med=3.445325  max=53.17832  p(90)=7.748208  p(95)=10.164257
send_message_duration..........: avg=17.886243 min=11.382567 med=15.793961 max=78.108903 p(90)=25.442208 p(95)=29.83017

HTTP
http_req_duration..............: avg=21.01ms   min=2.06ms    med=15.85ms   max=89.67ms   p(90)=45.96ms   p(95)=47.53ms
{ expected_response:true }...: avg=21.01ms   min=2.06ms    med=15.85ms   max=89.67ms   p(90)=45.96ms   p(95)=47.53ms
http_req_failed................: 0.00%  0 out of 5145
http_reqs......................: 5145   27.837579/s

EXECUTION
iteration_duration.............: avg=6.13s     min=4.89s     med=6.16s     max=7.33s     p(90)=6.76s     p(95)=6.92s
iterations.....................: 1029   5.567516/s
vus............................: 1      min=1         max=50
vus_max........................: 50     min=50        max=50

NETWORK
data_received..................: 19 MB  101 kB/s
data_sent......................: 1.7 MB 9.3 kB/s

```

---

## 6. Conclusion

The performance bottleneck was successfully identified as **excessive object hydration** caused by over-fetching relations in Prisma.

By filtering the `userChat` relation to load only the relevant record, we reduced the complexity of the operation from **O(Messages × TotalUserChats)** to **O(Messages)**. This is expected to bring P95 latency down significantly, well within the `<500ms` target.
