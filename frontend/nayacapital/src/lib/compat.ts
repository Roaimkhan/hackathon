type AnyRow = Record<string, any>

const pick = (row: AnyRow, keys: string[], fallback: any = undefined) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key]
    }
  }
  return fallback
}

export const normalizeUserRow = (row: AnyRow): AnyRow => ({
  ...row,
  id: pick(row, ['id', 'uid', 'user_id']),
  uid: pick(row, ['uid', 'id', 'user_id']),
  user_id: pick(row, ['user_id', 'id', 'uid']),
  created_at: pick(row, ['created_at', 'time']),
  time: pick(row, ['time', 'created_at']),
  kyc_status: pick(row, ['kyc_status'], 'pending'),
  wallet_balance: pick(row, ['wallet_balance'], 0),
})

export const normalizeStartupRow = (row: AnyRow): AnyRow => {
  const amountRaised = Number(pick(row, ['amount_raised'], 0) || 0)
  const fundingGoal = Number(pick(row, ['funding_goal'], 0) || 0)

  return {
    ...row,
    id: pick(row, ['id', 'uid']),
    uid: pick(row, ['uid', 'id']),
    created_at: pick(row, ['created_at', 'time']),
    time: pick(row, ['time', 'created_at']),
    investor_count: Number(pick(row, ['investor_count', 'investors_count'], 0) || 0),
    investors_count: Number(pick(row, ['investors_count', 'investor_count'], 0) || 0),
    funding_progress: fundingGoal > 0 ? Math.round((amountRaised / fundingGoal) * 10000) / 100 : 0,
  }
}

export const normalizeMilestoneRow = (row: AnyRow): AnyRow => ({
  ...row,
  id: pick(row, ['id', 'uid']),
  uid: pick(row, ['uid', 'id']),
  startup_id: pick(row, ['startup_id', 'startup_uid']),
  startup_uid: pick(row, ['startup_uid', 'startup_id']),
  created_at: pick(row, ['created_at', 'time']),
  time: pick(row, ['time', 'created_at']),
  submitted_at: pick(row, ['submitted_at', 'updated_at', 'created_at', 'time']),
  updated_at: pick(row, ['updated_at', 'submitted_at', 'created_at', 'time']),
  fund_percentage: Number(pick(row, ['fund_percentage'], 0) || 0),
  proof_url: pick(row, ['proof_url']),
  rejection_reason: pick(row, ['rejection_reason']),
  status: pick(row, ['status'], 'pending'),
})

export const normalizeInvestmentRow = (row: AnyRow): AnyRow => {
  const startup = row.startups || row.startup || {}

  return {
    ...row,
    id: pick(row, ['id', 'uid']),
    uid: pick(row, ['uid', 'id']),
    startup_id: pick(row, ['startup_id', 'startup_uid']),
    startup_uid: pick(row, ['startup_uid', 'startup_id']),
    investor_id: pick(row, ['investor_id', 'user_id', 'uid']),
    user_id: pick(row, ['user_id', 'investor_id']),
    amount_pkr: Number(pick(row, ['amount_pkr', 'amount'], 0) || 0),
    amount: Number(pick(row, ['amount', 'amount_pkr'], 0) || 0),
    equity_percent: Number(pick(row, ['equity_percent', 'equity_percentage'], 0) || 0),
    equity_percentage: Number(pick(row, ['equity_percentage', 'equity_percent'], 0) || 0),
    created_at: pick(row, ['created_at', 'time']),
    time: pick(row, ['time', 'created_at']),
    startup_name: row.startup_name || startup.name || 'Startup',
    sector: row.sector || startup.sector || 'Other',
    status: row.status || startup.status || 'active',
  }
}

export const normalizeTransactionRow = (row: AnyRow): AnyRow => ({
  ...row,
  id: pick(row, ['id', 'uid']),
  uid: pick(row, ['uid', 'id']),
  user_id: pick(row, ['user_id', 'uid', 'investor_id']),
  amount_pkr: Number(pick(row, ['amount_pkr', 'amount'], 0) || 0),
  amount: Number(pick(row, ['amount', 'amount_pkr'], 0) || 0),
  created_at: pick(row, ['created_at', 'time']),
  time: pick(row, ['time', 'created_at']),
  reference: pick(row, ['reference']),
  type: pick(row, ['type'], 'unknown'),
})