# SafeDeal OS – Backend Schema (MVP)

## users
- id (pk)
- username
- name
- avatar_color
- created_at

## posts
- id (pk)
- author_id (fk → users.id)
- type (task | job | service | channel | ad | opportunity)
- title
- short_description
- description
- budget
- category
- meta_label
- meta_value
- deadline
- created_at
- is_promoted
- promotion_ends_at

## channels
- id (pk)
- post_id (fk → posts.id) — запис у каталозі
- username
- url
- topic
- subscribers
- avg_post_reach
- avg_ad_reach
- er
- posts_per_day

## deals
- id (pk)
- task_post_id (fk → posts.id)
- buyer_id (fk → users.id)
- seller_id (fk → users.id)
- amount
- status (active | in_review | completed | dispute | dispute_resolved)
- escrow_meta (jsonb)
- created_at

## ad_deals
- id (pk)
- advertiser_id (fk → users.id)
- channel_owner_id (fk → users.id)
- channel_post_id (fk → posts.id)
- creative_id (fk → ad_creatives.id)
- slot_id
- status (draft | pending_approval | approved | scheduled | published | completed | dispute | resolved | rejected)
- escrow_amount
- post_url
- scheduled_at
- timeline (jsonb)
- messages (jsonb)
- created_at

## ad_creatives
- id (pk)
- author_id (fk → users.id)
- title
- text
- media_url
- cta_link
- status (draft | active)
- created_at

## wallet_transactions
- id (pk)
- user_id (fk → users.id)
- type (hold | release | payout | refund | fee | topup | withdraw)
- amount
- label
- meta (jsonb)
- created_at

## ratings
- id (pk)
- user_id (fk → users.id)
- from_user_id (fk → users.id)
- deal_id (fk → deals.id, nullable)
- ad_deal_id (fk → ad_deals.id, nullable)
- score (1–5)
- comment
- created_at

## notifications
- id (pk)
- user_id (fk → users.id)
- type (ad_approved | ad_rejected | deal_completed | deal_published | dispute_opened)
- payload (jsonb)
- is_read
- created_at

