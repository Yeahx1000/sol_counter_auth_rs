import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { SolCounterAuthRs } from "../target/types/sol_counter_auth_rs.js";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("counter-auth-rs", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solCounterAuthRs as Program<SolCounterAuthRs>;

  it("Initializes", async () => {
    const counter = Keypair.generate();
    const authority = provider.wallet.publicKey;

    await program.methods
      .initialize(authority)
      .accounts({
        counter: counter.publicKey,
        authority: authority,
        // systemProgram: SystemProgram.programId,
      })
      .signers([counter])
      .rpc();

    const acct = await program.account.counter.fetch(counter.publicKey);
    expect(acct.count.toNumber()).to.eq(0)
    expect(acct.authority.toBase58()).to.eq(authority.toBase58())
  });

  it("Increments", async () => {
    const counter = Keypair.generate();
    const authority = provider.wallet.publicKey;

    await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        authority: authority,
      })
      .signers([counter])
      .rpc();

    await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        authority: authority,
      })
      .rpc();

    const acct = await program.account.counter.fetch(counter.publicKey);
    expect(acct.count.toNumber()).to.eq(1)

    const intruder = Keypair.generate();
    // TODO: confirmTRansaction is deprecated, will come back to this.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(intruder.publicKey, 1_000_000_000),
      "confirmed"
    )

    try {
      await program.methods
        .increment()
        .accounts({
          counter: counter.publicKey,
          authority: intruder.publicKey,
        })
        .signers([intruder])
        .rpc();
      expect.fail("Expected error not thrown");
    } catch (error) {
      expect(error).to.be.an.instanceOf(anchor.AnchorError);
    }
  });

  it("Sets authority", async () => {
    const counter = Keypair.generate();
    const authority = provider.wallet.publicKey;
    const newAuthority = Keypair.generate();

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(newAuthority.publicKey, 1_000_000_000),
      "confirmed"
    )


    await program.methods
      .initialize(authority)
      .accounts({
        counter: counter.publicKey,
        authority: authority,
      })
      .signers([counter])
      .rpc();

    await program.methods
      .setAuthority(newAuthority.publicKey)
      .accounts({
        counter: counter.publicKey,
        authority: authority,
      })
      .rpc();

    try {
      await program.methods
        .increment()
        .accounts({
          counter: counter.publicKey,
          authority: authority,
        })
        .rpc();
      expect.fail("Expected error not thrown");
    } catch (error) {
      expect(error).to.be.an.instanceOf(anchor.AnchorError);
    }


  })

  // const anchor = require("@coral-xyz/anchor");

  // describe("sol_counter_auth_rs", () => {
  //   // Configure the client to use the local cluster.
  //   anchor.setProvider(anchor.AnchorProvider.env());

  //   it("Is initialized!", async () => {
  //     // Add your test here.
  //     const program = anchor.workspace.solCounterAuthRs;
  //     const tx = await program.methods.initialize().rpc();
  //     console.log("Your transaction signature", tx);
  //   });
  // });
});
