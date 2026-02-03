use anchor_lang::prelude::*;

declare_id!("FLXfECCpH4CFUUf4c9YqDrYgWf96Nm5m23i9mvxDGYD6");

#[program]
pub mod sol_counter_auth_rs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
