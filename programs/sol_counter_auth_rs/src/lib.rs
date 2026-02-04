// on chain code.
use anchor_lang::prelude::*;

declare_id!("TO_REPLACE");

// won't compile without the actual program id.
//TODO: Add actual program id.

#[program]
pub mod sol_counter_auth_rs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = authority;
        counter.count = 0;

        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            counter.authority,
            CounterError::Unauthorized
        );

        counter.count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;

        Ok(())
    }

    pub fn set_authority(ctx: Context<SetAuthority>, new_authority: Pubkey) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            counter.authority,
            CounterError::Unauthorized
        );

        counter.authority = new_authority;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Counter::INIT_SPACE)]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetAuthority<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
}

#[error_code]
pub enum CounterError {
    #[msg("Unauthorized Access: only the those with proper permissions can increment the counter")]
    Unauthorized,
    #[msg("Counter has overflowed")]
    Overflow,
}
