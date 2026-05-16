import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum GameMode { CASUAL = 0,
                       STANDARD = 1,
                       STRATEGIC = 2,
                       CLASSIC = 3,
                       CASINO = 4
}

export enum MatchPhase { WAITING_FOR_PLAYER_TWO = 0,
                         WAITING_FOR_ENTROPY_REVEAL = 1,
                         PLAYING = 2,
                         AWAITING_RESPONSE = 3,
                         GAMEOVER = 4
}

export type Witnesses<PS> = {
  revealLastPlay(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { count: bigint,
                                                                               rank0: bigint,
                                                                               salt0: Uint8Array,
                                                                               rank1: bigint,
                                                                               salt1: Uint8Array,
                                                                               rank2: bigint,
                                                                               salt2: Uint8Array,
                                                                               rank3: bigint,
                                                                               salt3: Uint8Array
                                                                             }];
}

export type ImpureCircuits<PS> = {
  createMatch(context: __compactRuntime.CircuitContext<PS>,
              mode_0: bigint,
              wagerAmount_0: bigint,
              p1EntropyCommit_0: Uint8Array,
              currentTime_0: bigint,
              coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, Uint8Array>;
  joinMatch(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            p2EntropyCommit_0: Uint8Array,
            coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  revealSeed(context: __compactRuntime.CircuitContext<PS>,
             matchId_0: Uint8Array,
             p1Entropy_0: Uint8Array,
             p2Entropy_0: Uint8Array,
             startingRank_0: bigint,
             currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  playCards(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            playCommit_0: Uint8Array,
            claimedRank_0: bigint,
            claimedCount_0: bigint,
            currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptClaim(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array,
              currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  challengeClaim(context: __compactRuntime.CircuitContext<PS>,
                 matchId_0: Uint8Array,
                 currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveChallenge(context: __compactRuntime.CircuitContext<PS>,
                   matchId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  forfeitStalledChallenge(context: __compactRuntime.CircuitContext<PS>,
                          matchId_0: Uint8Array,
                          currentTime_0: bigint,
                          timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelUnjoinedMatch(context: __compactRuntime.CircuitContext<PS>,
                      matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  forfeitAbandonedMatch(context: __compactRuntime.CircuitContext<PS>,
                        matchId_0: Uint8Array,
                        currentTime_0: bigint,
                        timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getMatch(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, { playerOne: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       playerTwo: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       mode: bigint,
                                                                                                                       winThreshold: bigint,
                                                                                                                       wagerAmount: bigint,
                                                                                                                       createdAt: bigint,
                                                                                                                       p1EntropyCommit: Uint8Array,
                                                                                                                       p2EntropyCommit: Uint8Array,
                                                                                                                       combinedSeed: Uint8Array,
                                                                                                                       seedFinalized: boolean,
                                                                                                                       phase: bigint,
                                                                                                                       activePlayerIdx: bigint,
                                                                                                                       currentRank: bigint,
                                                                                                                       lastActionAt: bigint,
                                                                                                                       lastClaimRank: bigint,
                                                                                                                       lastClaimCount: bigint,
                                                                                                                       lastPlayCommit: Uint8Array,
                                                                                                                       lastPlayerIdx: bigint,
                                                                                                                       hasPendingPlay: boolean,
                                                                                                                       challengeCalledAt: bigint,
                                                                                                                       isChallenged: boolean,
                                                                                                                       pileSize: bigint,
                                                                                                                       p1Score: bigint,
                                                                                                                       p2Score: bigint,
                                                                                                                       p1HandSize: bigint,
                                                                                                                       p2HandSize: bigint,
                                                                                                                       winner: bigint,
                                                                                                                       escrowReleased: boolean,
                                                                                                                       potHasCoin: boolean
                                                                                                                     }>;
  getMatchPhase(context: __compactRuntime.CircuitContext<PS>,
                matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getWinner(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  createMatch(context: __compactRuntime.CircuitContext<PS>,
              mode_0: bigint,
              wagerAmount_0: bigint,
              p1EntropyCommit_0: Uint8Array,
              currentTime_0: bigint,
              coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, Uint8Array>;
  joinMatch(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            p2EntropyCommit_0: Uint8Array,
            coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  revealSeed(context: __compactRuntime.CircuitContext<PS>,
             matchId_0: Uint8Array,
             p1Entropy_0: Uint8Array,
             p2Entropy_0: Uint8Array,
             startingRank_0: bigint,
             currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  playCards(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            playCommit_0: Uint8Array,
            claimedRank_0: bigint,
            claimedCount_0: bigint,
            currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptClaim(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array,
              currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  challengeClaim(context: __compactRuntime.CircuitContext<PS>,
                 matchId_0: Uint8Array,
                 currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveChallenge(context: __compactRuntime.CircuitContext<PS>,
                   matchId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  forfeitStalledChallenge(context: __compactRuntime.CircuitContext<PS>,
                          matchId_0: Uint8Array,
                          currentTime_0: bigint,
                          timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelUnjoinedMatch(context: __compactRuntime.CircuitContext<PS>,
                      matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  forfeitAbandonedMatch(context: __compactRuntime.CircuitContext<PS>,
                        matchId_0: Uint8Array,
                        currentTime_0: bigint,
                        timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getMatch(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, { playerOne: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       playerTwo: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       mode: bigint,
                                                                                                                       winThreshold: bigint,
                                                                                                                       wagerAmount: bigint,
                                                                                                                       createdAt: bigint,
                                                                                                                       p1EntropyCommit: Uint8Array,
                                                                                                                       p2EntropyCommit: Uint8Array,
                                                                                                                       combinedSeed: Uint8Array,
                                                                                                                       seedFinalized: boolean,
                                                                                                                       phase: bigint,
                                                                                                                       activePlayerIdx: bigint,
                                                                                                                       currentRank: bigint,
                                                                                                                       lastActionAt: bigint,
                                                                                                                       lastClaimRank: bigint,
                                                                                                                       lastClaimCount: bigint,
                                                                                                                       lastPlayCommit: Uint8Array,
                                                                                                                       lastPlayerIdx: bigint,
                                                                                                                       hasPendingPlay: boolean,
                                                                                                                       challengeCalledAt: bigint,
                                                                                                                       isChallenged: boolean,
                                                                                                                       pileSize: bigint,
                                                                                                                       p1Score: bigint,
                                                                                                                       p2Score: bigint,
                                                                                                                       p1HandSize: bigint,
                                                                                                                       p2HandSize: bigint,
                                                                                                                       winner: bigint,
                                                                                                                       escrowReleased: boolean,
                                                                                                                       potHasCoin: boolean
                                                                                                                     }>;
  getMatchPhase(context: __compactRuntime.CircuitContext<PS>,
                matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getWinner(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createMatch(context: __compactRuntime.CircuitContext<PS>,
              mode_0: bigint,
              wagerAmount_0: bigint,
              p1EntropyCommit_0: Uint8Array,
              currentTime_0: bigint,
              coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, Uint8Array>;
  joinMatch(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            p2EntropyCommit_0: Uint8Array,
            coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  revealSeed(context: __compactRuntime.CircuitContext<PS>,
             matchId_0: Uint8Array,
             p1Entropy_0: Uint8Array,
             p2Entropy_0: Uint8Array,
             startingRank_0: bigint,
             currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  playCards(context: __compactRuntime.CircuitContext<PS>,
            matchId_0: Uint8Array,
            playCommit_0: Uint8Array,
            claimedRank_0: bigint,
            claimedCount_0: bigint,
            currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  acceptClaim(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array,
              currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  challengeClaim(context: __compactRuntime.CircuitContext<PS>,
                 matchId_0: Uint8Array,
                 currentTime_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveChallenge(context: __compactRuntime.CircuitContext<PS>,
                   matchId_0: Uint8Array,
                   currentTime_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  forfeitStalledChallenge(context: __compactRuntime.CircuitContext<PS>,
                          matchId_0: Uint8Array,
                          currentTime_0: bigint,
                          timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelUnjoinedMatch(context: __compactRuntime.CircuitContext<PS>,
                      matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  forfeitAbandonedMatch(context: __compactRuntime.CircuitContext<PS>,
                        matchId_0: Uint8Array,
                        currentTime_0: bigint,
                        timeoutSeconds_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>,
              matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getMatch(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, { playerOne: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       playerTwo: { bytes: Uint8Array
                                                                                                                                  },
                                                                                                                       mode: bigint,
                                                                                                                       winThreshold: bigint,
                                                                                                                       wagerAmount: bigint,
                                                                                                                       createdAt: bigint,
                                                                                                                       p1EntropyCommit: Uint8Array,
                                                                                                                       p2EntropyCommit: Uint8Array,
                                                                                                                       combinedSeed: Uint8Array,
                                                                                                                       seedFinalized: boolean,
                                                                                                                       phase: bigint,
                                                                                                                       activePlayerIdx: bigint,
                                                                                                                       currentRank: bigint,
                                                                                                                       lastActionAt: bigint,
                                                                                                                       lastClaimRank: bigint,
                                                                                                                       lastClaimCount: bigint,
                                                                                                                       lastPlayCommit: Uint8Array,
                                                                                                                       lastPlayerIdx: bigint,
                                                                                                                       hasPendingPlay: boolean,
                                                                                                                       challengeCalledAt: bigint,
                                                                                                                       isChallenged: boolean,
                                                                                                                       pileSize: bigint,
                                                                                                                       p1Score: bigint,
                                                                                                                       p2Score: bigint,
                                                                                                                       p1HandSize: bigint,
                                                                                                                       p2HandSize: bigint,
                                                                                                                       winner: bigint,
                                                                                                                       escrowReleased: boolean,
                                                                                                                       potHasCoin: boolean
                                                                                                                     }>;
  getMatchPhase(context: __compactRuntime.CircuitContext<PS>,
                matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getWinner(context: __compactRuntime.CircuitContext<PS>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  matches: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { playerOne: { bytes: Uint8Array },
                                 playerTwo: { bytes: Uint8Array },
                                 mode: bigint,
                                 winThreshold: bigint,
                                 wagerAmount: bigint,
                                 createdAt: bigint,
                                 p1EntropyCommit: Uint8Array,
                                 p2EntropyCommit: Uint8Array,
                                 combinedSeed: Uint8Array,
                                 seedFinalized: boolean,
                                 phase: bigint,
                                 activePlayerIdx: bigint,
                                 currentRank: bigint,
                                 lastActionAt: bigint,
                                 lastClaimRank: bigint,
                                 lastClaimCount: bigint,
                                 lastPlayCommit: Uint8Array,
                                 lastPlayerIdx: bigint,
                                 hasPendingPlay: boolean,
                                 challengeCalledAt: bigint,
                                 isChallenged: boolean,
                                 pileSize: bigint,
                                 p1Score: bigint,
                                 p2Score: bigint,
                                 p1HandSize: bigint,
                                 p2HandSize: bigint,
                                 winner: bigint,
                                 escrowReleased: boolean,
                                 potHasCoin: boolean
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { playerOne: { bytes: Uint8Array },
  playerTwo: { bytes: Uint8Array },
  mode: bigint,
  winThreshold: bigint,
  wagerAmount: bigint,
  createdAt: bigint,
  p1EntropyCommit: Uint8Array,
  p2EntropyCommit: Uint8Array,
  combinedSeed: Uint8Array,
  seedFinalized: boolean,
  phase: bigint,
  activePlayerIdx: bigint,
  currentRank: bigint,
  lastActionAt: bigint,
  lastClaimRank: bigint,
  lastClaimCount: bigint,
  lastPlayCommit: Uint8Array,
  lastPlayerIdx: bigint,
  hasPendingPlay: boolean,
  challengeCalledAt: bigint,
  isChallenged: boolean,
  pileSize: bigint,
  p1Score: bigint,
  p2Score: bigint,
  p1HandSize: bigint,
  p2HandSize: bigint,
  winner: bigint,
  escrowReleased: boolean,
  potHasCoin: boolean
}]>
  };
  matchPots: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { nonce: Uint8Array,
                                 color: Uint8Array,
                                 value: bigint,
                                 mt_index: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { nonce: Uint8Array, color: Uint8Array, value: bigint, mt_index: bigint }]>
  };
  readonly totalMatchesCreated: bigint;
  readonly totalMatchesCompleted: bigint;
  readonly totalChallengesIssued: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
