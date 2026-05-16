import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var GameMode;
(function (GameMode) {
  GameMode[GameMode['CASUAL'] = 0] = 'CASUAL';
  GameMode[GameMode['STANDARD'] = 1] = 'STANDARD';
  GameMode[GameMode['STRATEGIC'] = 2] = 'STRATEGIC';
  GameMode[GameMode['CLASSIC'] = 3] = 'CLASSIC';
  GameMode[GameMode['CASINO'] = 4] = 'CASINO';
})(GameMode || (GameMode = {}));

export var MatchPhase;
(function (MatchPhase) {
  MatchPhase[MatchPhase['WAITING_FOR_PLAYER_TWO'] = 0] = 'WAITING_FOR_PLAYER_TWO';
  MatchPhase[MatchPhase['WAITING_FOR_ENTROPY_REVEAL'] = 1] = 'WAITING_FOR_ENTROPY_REVEAL';
  MatchPhase[MatchPhase['PLAYING'] = 2] = 'PLAYING';
  MatchPhase[MatchPhase['AWAITING_RESPONSE'] = 3] = 'AWAITING_RESPONSE';
  MatchPhase[MatchPhase['GAMEOVER'] = 4] = 'GAMEOVER';
})(MatchPhase || (MatchPhase = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

class _ZswapCoinPublicKey_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_1 = new _ZswapCoinPublicKey_0();

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = __compactRuntime.CompactTypeBoolean;

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

class _MatchState_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_4.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_4.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_2.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment()))))))))))))))))))))))))))));
  }
  fromValue(value_0) {
    return {
      playerOne: _descriptor_1.fromValue(value_0),
      playerTwo: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      winThreshold: _descriptor_2.fromValue(value_0),
      wagerAmount: _descriptor_3.fromValue(value_0),
      createdAt: _descriptor_3.fromValue(value_0),
      p1EntropyCommit: _descriptor_0.fromValue(value_0),
      p2EntropyCommit: _descriptor_0.fromValue(value_0),
      combinedSeed: _descriptor_0.fromValue(value_0),
      seedFinalized: _descriptor_4.fromValue(value_0),
      phase: _descriptor_2.fromValue(value_0),
      activePlayerIdx: _descriptor_2.fromValue(value_0),
      currentRank: _descriptor_2.fromValue(value_0),
      lastActionAt: _descriptor_3.fromValue(value_0),
      lastClaimRank: _descriptor_2.fromValue(value_0),
      lastClaimCount: _descriptor_2.fromValue(value_0),
      lastPlayCommit: _descriptor_0.fromValue(value_0),
      lastPlayerIdx: _descriptor_2.fromValue(value_0),
      hasPendingPlay: _descriptor_4.fromValue(value_0),
      challengeCalledAt: _descriptor_3.fromValue(value_0),
      isChallenged: _descriptor_4.fromValue(value_0),
      pileSize: _descriptor_5.fromValue(value_0),
      p1Score: _descriptor_5.fromValue(value_0),
      p2Score: _descriptor_5.fromValue(value_0),
      p1HandSize: _descriptor_5.fromValue(value_0),
      p2HandSize: _descriptor_5.fromValue(value_0),
      winner: _descriptor_2.fromValue(value_0),
      escrowReleased: _descriptor_4.fromValue(value_0),
      potHasCoin: _descriptor_4.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.playerOne).concat(_descriptor_1.toValue(value_0.playerTwo).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_2.toValue(value_0.winThreshold).concat(_descriptor_3.toValue(value_0.wagerAmount).concat(_descriptor_3.toValue(value_0.createdAt).concat(_descriptor_0.toValue(value_0.p1EntropyCommit).concat(_descriptor_0.toValue(value_0.p2EntropyCommit).concat(_descriptor_0.toValue(value_0.combinedSeed).concat(_descriptor_4.toValue(value_0.seedFinalized).concat(_descriptor_2.toValue(value_0.phase).concat(_descriptor_2.toValue(value_0.activePlayerIdx).concat(_descriptor_2.toValue(value_0.currentRank).concat(_descriptor_3.toValue(value_0.lastActionAt).concat(_descriptor_2.toValue(value_0.lastClaimRank).concat(_descriptor_2.toValue(value_0.lastClaimCount).concat(_descriptor_0.toValue(value_0.lastPlayCommit).concat(_descriptor_2.toValue(value_0.lastPlayerIdx).concat(_descriptor_4.toValue(value_0.hasPendingPlay).concat(_descriptor_3.toValue(value_0.challengeCalledAt).concat(_descriptor_4.toValue(value_0.isChallenged).concat(_descriptor_5.toValue(value_0.pileSize).concat(_descriptor_5.toValue(value_0.p1Score).concat(_descriptor_5.toValue(value_0.p2Score).concat(_descriptor_5.toValue(value_0.p1HandSize).concat(_descriptor_5.toValue(value_0.p2HandSize).concat(_descriptor_2.toValue(value_0.winner).concat(_descriptor_4.toValue(value_0.escrowReleased).concat(_descriptor_4.toValue(value_0.potHasCoin)))))))))))))))))))))))))))));
  }
}

const _descriptor_6 = new _MatchState_0();

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _QualifiedShieldedCoinInfo_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_7.alignment().concat(_descriptor_3.alignment())));
  }
  fromValue(value_0) {
    return {
      nonce: _descriptor_0.fromValue(value_0),
      color: _descriptor_0.fromValue(value_0),
      value: _descriptor_7.fromValue(value_0),
      mt_index: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.nonce).concat(_descriptor_0.toValue(value_0.color).concat(_descriptor_7.toValue(value_0.value).concat(_descriptor_3.toValue(value_0.mt_index))));
  }
}

const _descriptor_8 = new _QualifiedShieldedCoinInfo_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _ShieldedCoinInfo_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_7.alignment()));
  }
  fromValue(value_0) {
    return {
      nonce: _descriptor_0.fromValue(value_0),
      color: _descriptor_0.fromValue(value_0),
      value: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.nonce).concat(_descriptor_0.toValue(value_0.color).concat(_descriptor_7.toValue(value_0.value)));
  }
}

const _descriptor_10 = new _ShieldedCoinInfo_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

class _Either_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_1.alignment().concat(_descriptor_11.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_1.fromValue(value_0),
      right: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_1.toValue(value_0.left).concat(_descriptor_11.toValue(value_0.right)));
  }
}

const _descriptor_12 = new _Either_0();

class _PlayRevealWitness_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()))))))));
  }
  fromValue(value_0) {
    return {
      count: _descriptor_2.fromValue(value_0),
      rank0: _descriptor_2.fromValue(value_0),
      salt0: _descriptor_0.fromValue(value_0),
      rank1: _descriptor_2.fromValue(value_0),
      salt1: _descriptor_0.fromValue(value_0),
      rank2: _descriptor_2.fromValue(value_0),
      salt2: _descriptor_0.fromValue(value_0),
      rank3: _descriptor_2.fromValue(value_0),
      salt3: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.count).concat(_descriptor_2.toValue(value_0.rank0).concat(_descriptor_0.toValue(value_0.salt0).concat(_descriptor_2.toValue(value_0.rank1).concat(_descriptor_0.toValue(value_0.salt1).concat(_descriptor_2.toValue(value_0.rank2).concat(_descriptor_0.toValue(value_0.salt2).concat(_descriptor_2.toValue(value_0.rank3).concat(_descriptor_0.toValue(value_0.salt3)))))))));
  }
}

const _descriptor_13 = new _PlayRevealWitness_0();

const _descriptor_14 = __compactRuntime.CompactTypeField;

const _descriptor_15 = new __compactRuntime.CompactTypeBytes(21);

class _CoinPreimage_0 {
  alignment() {
    return _descriptor_15.alignment().concat(_descriptor_10.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      domain_sep: _descriptor_15.fromValue(value_0),
      info: _descriptor_10.fromValue(value_0),
      dataType: _descriptor_4.fromValue(value_0),
      data: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_15.toValue(value_0.domain_sep).concat(_descriptor_10.toValue(value_0.info).concat(_descriptor_4.toValue(value_0.dataType).concat(_descriptor_0.toValue(value_0.data))));
  }
}

const _descriptor_16 = new _CoinPreimage_0();

class _EntropyCommitInput_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      separator: _descriptor_0.fromValue(value_0),
      entropy: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.separator).concat(_descriptor_0.toValue(value_0.entropy));
  }
}

const _descriptor_17 = new _EntropyCommitInput_0();

class _MatchIdInput_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment())));
  }
  fromValue(value_0) {
    return {
      separator: _descriptor_0.fromValue(value_0),
      playerOne: _descriptor_1.fromValue(value_0),
      mode: _descriptor_2.fromValue(value_0),
      createdAt: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.separator).concat(_descriptor_1.toValue(value_0.playerOne).concat(_descriptor_2.toValue(value_0.mode).concat(_descriptor_3.toValue(value_0.createdAt))));
  }
}

const _descriptor_18 = new _MatchIdInput_0();

class _SeedInput_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      separator: _descriptor_0.fromValue(value_0),
      p1Entropy: _descriptor_0.fromValue(value_0),
      p2Entropy: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.separator).concat(_descriptor_0.toValue(value_0.p1Entropy).concat(_descriptor_0.toValue(value_0.p2Entropy)));
  }
}

const _descriptor_19 = new _SeedInput_0();

const _descriptor_20 = new __compactRuntime.CompactTypeVector(2, _descriptor_14);

class _Maybe_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_10.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_4.fromValue(value_0),
      value: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_some).concat(_descriptor_10.toValue(value_0.value));
  }
}

const _descriptor_21 = new _Maybe_0();

class _ShieldedSendResult_0 {
  alignment() {
    return _descriptor_21.alignment().concat(_descriptor_10.alignment());
  }
  fromValue(value_0) {
    return {
      change: _descriptor_21.fromValue(value_0),
      sent: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_21.toValue(value_0.change).concat(_descriptor_10.toValue(value_0.sent));
  }
}

const _descriptor_22 = new _ShieldedSendResult_0();

class _Either_1 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_23 = new _Either_1();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.revealLastPlay) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named revealLastPlay');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      createMatch: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`createMatch: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const mode_0 = args_1[1];
        const wagerAmount_0 = args_1[2];
        const p1EntropyCommit_0 = args_1[3];
        const currentTime_0 = args_1[4];
        const coin_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(mode_0) === 'bigint' && mode_0 >= 0n && mode_0 <= 255n)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'Uint<0..256>',
                                     mode_0)
        }
        if (!(typeof(wagerAmount_0) === 'bigint' && wagerAmount_0 >= 0n && wagerAmount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'Uint<0..18446744073709551616>',
                                     wagerAmount_0)
        }
        if (!(p1EntropyCommit_0.buffer instanceof ArrayBuffer && p1EntropyCommit_0.BYTES_PER_ELEMENT === 1 && p1EntropyCommit_0.length === 32)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'Bytes<32>',
                                     p1EntropyCommit_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        if (!(typeof(coin_0) === 'object' && coin_0.nonce.buffer instanceof ArrayBuffer && coin_0.nonce.BYTES_PER_ELEMENT === 1 && coin_0.nonce.length === 32 && coin_0.color.buffer instanceof ArrayBuffer && coin_0.color.BYTES_PER_ELEMENT === 1 && coin_0.color.length === 32 && typeof(coin_0.value) === 'bigint' && coin_0.value >= 0n && coin_0.value <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('createMatch',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 278 char 1',
                                     'struct ShieldedCoinInfo<nonce: Bytes<32>, color: Bytes<32>, value: Uint<0..340282366920938463463374607431768211456>>',
                                     coin_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(mode_0).concat(_descriptor_3.toValue(wagerAmount_0).concat(_descriptor_0.toValue(p1EntropyCommit_0).concat(_descriptor_3.toValue(currentTime_0).concat(_descriptor_10.toValue(coin_0))))),
            alignment: _descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_10.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createMatch_0(context,
                                             partialProofData,
                                             mode_0,
                                             wagerAmount_0,
                                             p1EntropyCommit_0,
                                             currentTime_0,
                                             coin_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      joinMatch: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`joinMatch: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const p2EntropyCommit_0 = args_1[2];
        const coin_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('joinMatch',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 346 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('joinMatch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 346 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(p2EntropyCommit_0.buffer instanceof ArrayBuffer && p2EntropyCommit_0.BYTES_PER_ELEMENT === 1 && p2EntropyCommit_0.length === 32)) {
          __compactRuntime.typeError('joinMatch',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 346 char 1',
                                     'Bytes<32>',
                                     p2EntropyCommit_0)
        }
        if (!(typeof(coin_0) === 'object' && coin_0.nonce.buffer instanceof ArrayBuffer && coin_0.nonce.BYTES_PER_ELEMENT === 1 && coin_0.nonce.length === 32 && coin_0.color.buffer instanceof ArrayBuffer && coin_0.color.BYTES_PER_ELEMENT === 1 && coin_0.color.length === 32 && typeof(coin_0.value) === 'bigint' && coin_0.value >= 0n && coin_0.value <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('joinMatch',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 346 char 1',
                                     'struct ShieldedCoinInfo<nonce: Bytes<32>, color: Bytes<32>, value: Uint<0..340282366920938463463374607431768211456>>',
                                     coin_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(p2EntropyCommit_0).concat(_descriptor_10.toValue(coin_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_10.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._joinMatch_0(context,
                                           partialProofData,
                                           matchId_0,
                                           p2EntropyCommit_0,
                                           coin_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revealSeed: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`revealSeed: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const p1Entropy_0 = args_1[2];
        const p2Entropy_0 = args_1[3];
        const startingRank_0 = args_1[4];
        const currentTime_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(p1Entropy_0.buffer instanceof ArrayBuffer && p1Entropy_0.BYTES_PER_ELEMENT === 1 && p1Entropy_0.length === 32)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'Bytes<32>',
                                     p1Entropy_0)
        }
        if (!(p2Entropy_0.buffer instanceof ArrayBuffer && p2Entropy_0.BYTES_PER_ELEMENT === 1 && p2Entropy_0.length === 32)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'Bytes<32>',
                                     p2Entropy_0)
        }
        if (!(typeof(startingRank_0) === 'bigint' && startingRank_0 >= 0n && startingRank_0 <= 255n)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'Uint<0..256>',
                                     startingRank_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('revealSeed',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 416 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(p1Entropy_0).concat(_descriptor_0.toValue(p2Entropy_0).concat(_descriptor_2.toValue(startingRank_0).concat(_descriptor_3.toValue(currentTime_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revealSeed_0(context,
                                            partialProofData,
                                            matchId_0,
                                            p1Entropy_0,
                                            p2Entropy_0,
                                            startingRank_0,
                                            currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      playCards: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`playCards: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const playCommit_0 = args_1[2];
        const claimedRank_0 = args_1[3];
        const claimedCount_0 = args_1[4];
        const currentTime_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('playCards',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('playCards',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(playCommit_0.buffer instanceof ArrayBuffer && playCommit_0.BYTES_PER_ELEMENT === 1 && playCommit_0.length === 32)) {
          __compactRuntime.typeError('playCards',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'Bytes<32>',
                                     playCommit_0)
        }
        if (!(typeof(claimedRank_0) === 'bigint' && claimedRank_0 >= 0n && claimedRank_0 <= 255n)) {
          __compactRuntime.typeError('playCards',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'Uint<0..256>',
                                     claimedRank_0)
        }
        if (!(typeof(claimedCount_0) === 'bigint' && claimedCount_0 >= 0n && claimedCount_0 <= 255n)) {
          __compactRuntime.typeError('playCards',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'Uint<0..256>',
                                     claimedCount_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('playCards',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 486 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(playCommit_0).concat(_descriptor_2.toValue(claimedRank_0).concat(_descriptor_2.toValue(claimedCount_0).concat(_descriptor_3.toValue(currentTime_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._playCards_0(context,
                                           partialProofData,
                                           matchId_0,
                                           playCommit_0,
                                           claimedRank_0,
                                           claimedCount_0,
                                           currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      acceptClaim: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`acceptClaim: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const currentTime_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('acceptClaim',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 562 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('acceptClaim',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 562 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('acceptClaim',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 562 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_3.toValue(currentTime_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._acceptClaim_0(context,
                                             partialProofData,
                                             matchId_0,
                                             currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      challengeClaim: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`challengeClaim: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const currentTime_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('challengeClaim',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 620 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('challengeClaim',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 620 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('challengeClaim',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 620 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_3.toValue(currentTime_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._challengeClaim_0(context,
                                                partialProofData,
                                                matchId_0,
                                                currentTime_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      resolveChallenge: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`resolveChallenge: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const currentTime_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('resolveChallenge',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 684 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('resolveChallenge',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 684 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('resolveChallenge',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 684 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_3.toValue(currentTime_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._resolveChallenge_0(context,
                                                  partialProofData,
                                                  matchId_0,
                                                  currentTime_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      forfeitStalledChallenge: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`forfeitStalledChallenge: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const currentTime_0 = args_1[2];
        const timeoutSeconds_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('forfeitStalledChallenge',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 805 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('forfeitStalledChallenge',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 805 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('forfeitStalledChallenge',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 805 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        if (!(typeof(timeoutSeconds_0) === 'bigint' && timeoutSeconds_0 >= 0n && timeoutSeconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('forfeitStalledChallenge',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 805 char 1',
                                     'Uint<0..18446744073709551616>',
                                     timeoutSeconds_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_3.toValue(currentTime_0).concat(_descriptor_3.toValue(timeoutSeconds_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._forfeitStalledChallenge_0(context,
                                                         partialProofData,
                                                         matchId_0,
                                                         currentTime_0,
                                                         timeoutSeconds_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      cancelUnjoinedMatch: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`cancelUnjoinedMatch: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('cancelUnjoinedMatch',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 888 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('cancelUnjoinedMatch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 888 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._cancelUnjoinedMatch_0(context,
                                                     partialProofData,
                                                     matchId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      forfeitAbandonedMatch: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`forfeitAbandonedMatch: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const currentTime_0 = args_1[2];
        const timeoutSeconds_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('forfeitAbandonedMatch',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 948 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('forfeitAbandonedMatch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 948 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        if (!(typeof(currentTime_0) === 'bigint' && currentTime_0 >= 0n && currentTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('forfeitAbandonedMatch',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 948 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentTime_0)
        }
        if (!(typeof(timeoutSeconds_0) === 'bigint' && timeoutSeconds_0 >= 0n && timeoutSeconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('forfeitAbandonedMatch',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 948 char 1',
                                     'Uint<0..18446744073709551616>',
                                     timeoutSeconds_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_3.toValue(currentTime_0).concat(_descriptor_3.toValue(timeoutSeconds_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._forfeitAbandonedMatch_0(context,
                                                       partialProofData,
                                                       matchId_0,
                                                       currentTime_0,
                                                       timeoutSeconds_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      claimPayout: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`claimPayout: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claimPayout',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1008 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('claimPayout',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1008 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._claimPayout_0(context,
                                             partialProofData,
                                             matchId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getMatch: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getMatch: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getMatch',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1072 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('getMatch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1072 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getMatch_0(context, partialProofData, matchId_0);
        partialProofData.output = { value: _descriptor_6.toValue(result_0), alignment: _descriptor_6.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getMatchPhase: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getMatchPhase: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getMatchPhase',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1077 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('getMatchPhase',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1077 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getMatchPhase_0(context,
                                               partialProofData,
                                               matchId_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      getWinner: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getWinner: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('getWinner',
                                     'argument 1 (as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1082 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.typeError('getWinner',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'proof-or-bluff.compact line 1082 char 1',
                                     'Bytes<32>',
                                     matchId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getWinner_0(context, partialProofData, matchId_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      createMatch: this.circuits.createMatch,
      joinMatch: this.circuits.joinMatch,
      revealSeed: this.circuits.revealSeed,
      playCards: this.circuits.playCards,
      acceptClaim: this.circuits.acceptClaim,
      challengeClaim: this.circuits.challengeClaim,
      resolveChallenge: this.circuits.resolveChallenge,
      forfeitStalledChallenge: this.circuits.forfeitStalledChallenge,
      cancelUnjoinedMatch: this.circuits.cancelUnjoinedMatch,
      forfeitAbandonedMatch: this.circuits.forfeitAbandonedMatch,
      claimPayout: this.circuits.claimPayout,
      getMatch: this.circuits.getMatch,
      getMatchPhase: this.circuits.getMatchPhase,
      getWinner: this.circuits.getWinner
    };
    this.provableCircuits = {
      createMatch: this.circuits.createMatch,
      joinMatch: this.circuits.joinMatch,
      revealSeed: this.circuits.revealSeed,
      playCards: this.circuits.playCards,
      acceptClaim: this.circuits.acceptClaim,
      challengeClaim: this.circuits.challengeClaim,
      resolveChallenge: this.circuits.resolveChallenge,
      forfeitStalledChallenge: this.circuits.forfeitStalledChallenge,
      cancelUnjoinedMatch: this.circuits.cancelUnjoinedMatch,
      forfeitAbandonedMatch: this.circuits.forfeitAbandonedMatch,
      claimPayout: this.circuits.claimPayout,
      getMatch: this.circuits.getMatch,
      getMatchPhase: this.circuits.getMatchPhase,
      getWinner: this.circuits.getWinner
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('joinMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('revealSeed', new __compactRuntime.ContractOperation());
    state_0.setOperation('playCards', new __compactRuntime.ContractOperation());
    state_0.setOperation('acceptClaim', new __compactRuntime.ContractOperation());
    state_0.setOperation('challengeClaim', new __compactRuntime.ContractOperation());
    state_0.setOperation('resolveChallenge', new __compactRuntime.ContractOperation());
    state_0.setOperation('forfeitStalledChallenge', new __compactRuntime.ContractOperation());
    state_0.setOperation('cancelUnjoinedMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('forfeitAbandonedMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('claimPayout', new __compactRuntime.ContractOperation());
    state_0.setOperation('getMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('getMatchPhase', new __compactRuntime.ContractOperation());
    state_0.setOperation('getWinner', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(2n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(3n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(4n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue({ bytes: new Uint8Array(32) }),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(5n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _some_0(value_0) { return { is_some: true, value: value_0 }; }
  _none_0() {
    return { is_some: false,
             value:
               { nonce: new Uint8Array(32), color: new Uint8Array(32), value: 0n } };
  }
  _left_0(value_0) {
    return { is_left: true, left: value_0, right: { bytes: new Uint8Array(32) } };
  }
  _right_0(value_0) {
    return { is_left: false, left: { bytes: new Uint8Array(32) }, right: value_0 };
  }
  _nativeToken_0() {
    return new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _receiveShielded_0(context, partialProofData, coin_0) {
    const recipient_0 = this._right_0(_descriptor_11.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                 partialProofData,
                                                                                                 [
                                                                                                  { dup: { n: 2 } },
                                                                                                  { idx: { cached: true,
                                                                                                           pushPath: false,
                                                                                                           path: [
                                                                                                                  { tag: 'value',
                                                                                                                    value: { value: _descriptor_2.toValue(0n),
                                                                                                                             alignment: _descriptor_2.alignment() } }] } },
                                                                                                  { popeq: { cached: true,
                                                                                                             result: undefined } }]).value));
    this._createZswapOutput_0(context, partialProofData, coin_0, recipient_0);
    const tmp_0 = this._coinCommitment_0(coin_0, recipient_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    return [];
  }
  _sendShielded_0(context, partialProofData, input_0, recipient_0, value_0) {
    const selfAddr_0 = _descriptor_11.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 2 } },
                                                                                   { idx: { cached: true,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_2.toValue(0n),
                                                                                                              alignment: _descriptor_2.alignment() } }] } },
                                                                                   { popeq: { cached: true,
                                                                                              result: undefined } }]).value);
    this._createZswapInput_0(context, partialProofData, input_0);
    const tmp_0 = this._coinNullifier_0(this._downcastQualifiedCoin_0(input_0),
                                        selfAddr_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    let t_0;
    const change_0 = (t_0 = input_0.value,
                      (__compactRuntime.assert(t_0 >= value_0,
                                               'result of subtraction would be negative'),
                       t_0 - value_0));
    const output_0 = { nonce:
                         this._upgradeFromTransient_0(this._transientHash_0([__compactRuntime.convertBytesToField(28,
                                                                                                                  new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101]),
                                                                                                                  '<standard library>'),
                                                                             this._degradeToTransient_0(input_0.nonce)])),
                       color: input_0.color,
                       value: value_0 };
    this._createZswapOutput_0(context, partialProofData, output_0, recipient_0);
    const tmp_1 = this._coinCommitment_0(output_0, recipient_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(2n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    if (!recipient_0.is_left
        &&
        this._equal_0(recipient_0.right.bytes, selfAddr_0.bytes))
    {
      const tmp_2 = this._coinCommitment_0(output_0, recipient_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_2.toValue(1n),
                                                                    alignment: _descriptor_2.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newNull().encode() } },
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
    }
    if (this._equal_1(change_0, 0n)) {
      return { change: this._none_0(), sent: output_0 };
    } else {
      const changeCoin_0 = { nonce:
                               this._upgradeFromTransient_0(this._transientHash_0([__compactRuntime.convertBytesToField(30,
                                                                                                                        new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101, 47, 50]),
                                                                                                                        '<standard library>'),
                                                                                   this._degradeToTransient_0(input_0.nonce)])),
                             color: input_0.color,
                             value: change_0 };
      this._createZswapOutput_0(context,
                                partialProofData,
                                changeCoin_0,
                                this._right_0(selfAddr_0));
      const cm_0 = this._coinCommitment_0(changeCoin_0,
                                          this._right_0(selfAddr_0));
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_2.toValue(2n),
                                                                    alignment: _descriptor_2.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(cm_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newNull().encode() } },
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { swap: { n: 0 } },
                                         { idx: { cached: true,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_2.toValue(1n),
                                                                    alignment: _descriptor_2.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(cm_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newNull().encode() } },
                                         { ins: { cached: true, n: 2 } },
                                         { swap: { n: 0 } }]);
      return { change: this._some_0(changeCoin_0), sent: output_0 };
    }
  }
  _mergeCoin_0(context, partialProofData, a_0, b_0) {
    const selfAddr_0 = _descriptor_11.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 2 } },
                                                                                   { idx: { cached: true,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_2.toValue(0n),
                                                                                                              alignment: _descriptor_2.alignment() } }] } },
                                                                                   { popeq: { cached: true,
                                                                                              result: undefined } }]).value);
    this._createZswapInput_0(context, partialProofData, a_0);
    const tmp_0 = this._coinNullifier_0(this._downcastQualifiedCoin_0(a_0),
                                        selfAddr_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    this._createZswapInput_0(context, partialProofData, b_0);
    const tmp_1 = this._coinNullifier_0(this._downcastQualifiedCoin_0(b_0),
                                        selfAddr_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    __compactRuntime.assert(this._equal_2(a_0.color, b_0.color),
                            'Can only merge coins of the same color');
    const newCoin_0 = { nonce:
                          this._upgradeFromTransient_0(this._transientHash_0([__compactRuntime.convertBytesToField(28,
                                                                                                                   new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101]),
                                                                                                                   '<standard library>'),
                                                                              this._degradeToTransient_0(a_0.nonce)])),
                        color: a_0.color,
                        value:
                          ((t1) => {
                            if (t1 > 340282366920938463463374607431768211455n) {
                              throw new __compactRuntime.CompactError('<standard library>: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                            }
                            return t1;
                          })(a_0.value + b_0.value) };
    this._createZswapOutput_0(context,
                              partialProofData,
                              newCoin_0,
                              this._right_0(selfAddr_0));
    const cm_0 = this._coinCommitment_0(newCoin_0, this._right_0(selfAddr_0));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(2n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(cm_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { swap: { n: 0 } },
                                       { idx: { cached: true,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(cm_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: true, n: 2 } },
                                       { swap: { n: 0 } }]);
    return newCoin_0;
  }
  _mergeCoinImmediate_0(context, partialProofData, a_0, b_0) {
    return this._mergeCoin_0(context,
                             partialProofData,
                             a_0,
                             this._upcastQualifiedCoin_0(b_0));
  }
  _downcastQualifiedCoin_0(coin_0) {
    return { nonce: coin_0.nonce, color: coin_0.color, value: coin_0.value };
  }
  _upcastQualifiedCoin_0(coin_0) {
    return { nonce: coin_0.nonce,
             color: coin_0.color,
             value: coin_0.value,
             mt_index: 0n };
  }
  _coinCommitment_0(coin_0, recipient_0) {
    return this._persistentHash_4({ domain_sep:
                                      new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 122, 115, 119, 97, 112, 45, 99, 99, 91, 118, 49, 93]),
                                    info: coin_0,
                                    dataType: recipient_0.is_left,
                                    data:
                                      recipient_0.is_left ?
                                      recipient_0.left.bytes :
                                      recipient_0.right.bytes });
  }
  _coinNullifier_0(coin_0, addr_0) {
    return this._persistentHash_4({ domain_sep:
                                      new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 122, 115, 119, 97, 112, 45, 99, 110, 91, 118, 49, 93]),
                                    info: coin_0,
                                    dataType: false,
                                    data: addr_0.bytes });
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_18, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_19, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_17, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_13, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_16, value_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _upgradeFromTransient_0(x_0) {
    const result_0 = __compactRuntime.upgradeFromTransient(x_0);
    return result_0;
  }
  _ownPublicKey_0(context, partialProofData) {
    const result_0 = __compactRuntime.ownPublicKey(context);
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _createZswapInput_0(context, partialProofData, coin_0) {
    const result_0 = __compactRuntime.createZswapInput(context, coin_0);
    partialProofData.privateTranscriptOutputs.push({
      value: [],
      alignment: []
    });
    return result_0;
  }
  _createZswapOutput_0(context, partialProofData, coin_0, recipient_0) {
    const result_0 = __compactRuntime.createZswapOutput(context,
                                                        coin_0,
                                                        recipient_0);
    partialProofData.privateTranscriptOutputs.push({
      value: [],
      alignment: []
    });
    return result_0;
  }
  _revealLastPlay_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.revealLastPlay(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.count) === 'bigint' && result_0.count >= 0n && result_0.count <= 255n && typeof(result_0.rank0) === 'bigint' && result_0.rank0 >= 0n && result_0.rank0 <= 255n && result_0.salt0.buffer instanceof ArrayBuffer && result_0.salt0.BYTES_PER_ELEMENT === 1 && result_0.salt0.length === 32 && typeof(result_0.rank1) === 'bigint' && result_0.rank1 >= 0n && result_0.rank1 <= 255n && result_0.salt1.buffer instanceof ArrayBuffer && result_0.salt1.BYTES_PER_ELEMENT === 1 && result_0.salt1.length === 32 && typeof(result_0.rank2) === 'bigint' && result_0.rank2 >= 0n && result_0.rank2 <= 255n && result_0.salt2.buffer instanceof ArrayBuffer && result_0.salt2.BYTES_PER_ELEMENT === 1 && result_0.salt2.length === 32 && typeof(result_0.rank3) === 'bigint' && result_0.rank3 >= 0n && result_0.rank3 <= 255n && result_0.salt3.buffer instanceof ArrayBuffer && result_0.salt3.BYTES_PER_ELEMENT === 1 && result_0.salt3.length === 32)) {
      __compactRuntime.typeError('revealLastPlay',
                                 'return value',
                                 'proof-or-bluff.compact line 185 char 1',
                                 'struct PlayRevealWitness<count: Uint<0..256>, rank0: Uint<0..256>, salt0: Bytes<32>, rank1: Uint<0..256>, salt1: Bytes<32>, rank2: Uint<0..256>, salt2: Bytes<32>, rank3: Uint<0..256>, salt3: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_13.toValue(result_0),
      alignment: _descriptor_13.alignment()
    });
    return result_0;
  }
  _computeMatchId_0(playerOne_0, mode_0, createdAt_0) {
    return this._persistentHash_0({ separator:
                                      new Uint8Array([112, 111, 98, 58, 109, 97, 116, 99, 104, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                    playerOne: playerOne_0,
                                    mode: mode_0,
                                    createdAt: createdAt_0 });
  }
  _verifyEntropyAgainstCommit_0(entropy_0, commit_0) {
    const computed_0 = this._persistentHash_2({ separator:
                                                  new Uint8Array([112, 111, 98, 58, 101, 110, 116, 114, 111, 112, 121, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                entropy: entropy_0 });
    return this._equal_3(computed_0, commit_0);
  }
  _initialHandSizeForMode_0(mode_0) {
    return this._equal_4(mode_0, 0n) ? 5n : this._equal_5(mode_0, 3n) ? 26n : 7n;
  }
  _winThresholdForMode_0(mode_0) {
    return this._equal_6(mode_0, 0n) ?
           10n :
           this._equal_7(mode_0, 1n) ?
           15n :
           this._equal_8(mode_0, 4n) ? 20n : 0n;
  }
  _isEmptyHandMode_0(mode_0) {
    return this._equal_9(mode_0, 2n) || this._equal_10(mode_0, 3n);
  }
  _nextRank_0(r_0) {
    if (r_0 >= 12n) {
      return 0n;
    } else {
      return ((t1) => {
               if (t1 > 255n) {
                 throw new __compactRuntime.CompactError('proof-or-bluff.compact line 252 char 10: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
               }
               return t1;
             })(r_0 + 1n);
    }
  }
  _subWithFloor32_0(a_0, b_0) {
    if (a_0 <= b_0) {
      return 0n;
    } else {
      __compactRuntime.assert(a_0 >= b_0,
                              'result of subtraction would be negative');
      return a_0 - b_0;
    }
  }
  _countMatchingRanks_0(reveal_0, target_0) {
    let t_0;
    const m0_0 = (t_0 = reveal_0.count, t_0 >= 1n)
                 &&
                 this._equal_11(reveal_0.rank0, target_0)
                 ?
                 1n :
                 0n;
    let t_1;
    const m1_0 = (t_1 = reveal_0.count, t_1 >= 2n)
                 &&
                 this._equal_12(reveal_0.rank1, target_0)
                 ?
                 1n :
                 0n;
    let t_2;
    const m2_0 = (t_2 = reveal_0.count, t_2 >= 3n)
                 &&
                 this._equal_13(reveal_0.rank2, target_0)
                 ?
                 1n :
                 0n;
    let t_3;
    const m3_0 = (t_3 = reveal_0.count, t_3 >= 4n)
                 &&
                 this._equal_14(reveal_0.rank3, target_0)
                 ?
                 1n :
                 0n;
    return ((t1) => {
             if (t1 > 255n) {
               throw new __compactRuntime.CompactError('proof-or-bluff.compact line 268 char 10: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
             }
             return t1;
           })(m0_0 + m1_0 + m2_0 + m3_0);
  }
  _createMatch_0(context,
                 partialProofData,
                 mode_0,
                 wagerAmount_0,
                 p1EntropyCommit_0,
                 currentTime_0,
                 coin_0)
  {
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    const matchId_0 = this._computeMatchId_0(caller_0, mode_0, currentTime_0);
    __compactRuntime.assert(!_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_2.toValue(0n),
                                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Match already exists');
    const receivedCoin_0 = coin_0;
    __compactRuntime.assert(this._equal_15(receivedCoin_0.color,
                                           this._nativeToken_0()),
                            'Creator coin must be native token');
    __compactRuntime.assert(this._equal_16(receivedCoin_0.value, wagerAmount_0),
                            'Creator coin value must match wager');
    this._receiveShielded_0(context, partialProofData, receivedCoin_0);
    const handSize_0 = this._initialHandSizeForMode_0(mode_0);
    const threshold_0 = this._winThresholdForMode_0(mode_0);
    const state_0 = { playerOne: caller_0,
                      playerTwo: caller_0,
                      mode: mode_0,
                      winThreshold: threshold_0,
                      wagerAmount: wagerAmount_0,
                      createdAt: currentTime_0,
                      p1EntropyCommit: p1EntropyCommit_0,
                      p2EntropyCommit:
                        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                      combinedSeed:
                        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                      seedFinalized: false,
                      phase: 0n,
                      activePlayerIdx: 0n,
                      currentRank: 0n,
                      lastActionAt: currentTime_0,
                      lastClaimRank: 0n,
                      lastClaimCount: 0n,
                      lastPlayCommit:
                        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                      lastPlayerIdx: 0n,
                      hasPendingPlay: false,
                      challengeCalledAt: 0n,
                      isChallenged: false,
                      pileSize: 0n,
                      p1Score: 0n,
                      p2Score: 0n,
                      p1HandSize: handSize_0,
                      p2HandSize: handSize_0,
                      winner: 0n,
                      escrowReleased: false,
                      potHasCoin: true };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(state_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = this._right_0(_descriptor_11.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                           partialProofData,
                                                                                           [
                                                                                            { dup: { n: 2 } },
                                                                                            { idx: { cached: true,
                                                                                                     pushPath: false,
                                                                                                     path: [
                                                                                                            { tag: 'value',
                                                                                                              value: { value: _descriptor_2.toValue(0n),
                                                                                                                       alignment: _descriptor_2.alignment() } }] } },
                                                                                            { popeq: { cached: true,
                                                                                                       result: undefined } }]).value));
    __compactRuntime.hasCoinCommitment(context, receivedCoin_0, tmp_0) ? __compactRuntime.queryLedgerState(context,
                                                                                                           partialProofData,
                                                                                                           [
                                                                                                            { idx: { cached: false,
                                                                                                                     pushPath: true,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_2.toValue(1n),
                                                                                                                                       alignment: _descriptor_2.alignment() } }] } },
                                                                                                            { push: { storage: false,
                                                                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                                                   alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                            { dup: { n: 5 } },
                                                                                                            { push: { storage: false,
                                                                                                                      value: __compactRuntime.StateValue.newCell(__compactRuntime.runtimeCoinCommitment(
                                                                                                                                                                   { value: _descriptor_10.toValue(receivedCoin_0),
                                                                                                                                                                     alignment: _descriptor_10.alignment() },
                                                                                                                                                                   { value: _descriptor_12.toValue(tmp_0),
                                                                                                                                                                     alignment: _descriptor_12.alignment() }
                                                                                                                                                                 )).encode() } },
                                                                                                            { idx: { cached: true,
                                                                                                                     pushPath: false,
                                                                                                                     path: [
                                                                                                                            { tag: 'value',
                                                                                                                              value: { value: _descriptor_2.toValue(1n),
                                                                                                                                       alignment: _descriptor_2.alignment() } },
                                                                                                                            { tag: 'stack' }] } },
                                                                                                            { push: { storage: false,
                                                                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(receivedCoin_0),
                                                                                                                                                                   alignment: _descriptor_10.alignment() }).encode() } },
                                                                                                            { swap: { n: 0 } },
                                                                                                            { concat: { cached: true,
                                                                                                                        n: 91 } },
                                                                                                            { ins: { cached: false,
                                                                                                                     n: 1 } },
                                                                                                            { ins: { cached: true,
                                                                                                                     n: 1 } }]) : (() => { throw new __compactRuntime.CompactError(`proof-or-bluff.compact line 335 char 3: Coin commitment not found. Check the coin has been received (or call 'createZswapOutput')`); })();
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(2n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_9.toValue(tmp_1),
                                                                alignment: _descriptor_9.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return matchId_0;
  }
  _joinMatch_0(context, partialProofData, matchId_0, p2EntropyCommit_0, coin_0)
  {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_17(m_0.phase, 0n),
                            'Match not open for joining');
    __compactRuntime.assert(m_0.potHasCoin, 'Match pot not initialized');
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(1n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match pot not found');
    const receivedCoin_0 = coin_0;
    __compactRuntime.assert(this._equal_18(receivedCoin_0.color,
                                           this._nativeToken_0()),
                            'Joiner coin must be native token');
    __compactRuntime.assert(this._equal_19(receivedCoin_0.value, m_0.wagerAmount),
                            'Joiner coin value must match wager');
    const joiner_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(!this._equal_20(joiner_0, m_0.playerOne),
                            'Creator cannot join as player two');
    const existingPot_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_2.toValue(1n),
                                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value);
    __compactRuntime.assert(this._equal_21(receivedCoin_0.color,
                                           existingPot_0.color),
                            'Joiner token must match pot token');
    this._receiveShielded_0(context, partialProofData, receivedCoin_0);
    const mergedPot_0 = this._mergeCoinImmediate_0(context,
                                                   partialProofData,
                                                   existingPot_0,
                                                   receivedCoin_0);
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: joiner_0,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: p2EntropyCommit_0,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: 1n,
                        activePlayerIdx: 0n,
                        currentRank: m_0.currentRank,
                        lastActionAt: m_0.lastActionAt,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: m_0.hasPendingPlay,
                        challengeCalledAt: m_0.challengeCalledAt,
                        isChallenged: m_0.isChallenged,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: m_0.winner,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = this._right_0(_descriptor_11.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                           partialProofData,
                                                                                           [
                                                                                            { dup: { n: 2 } },
                                                                                            { idx: { cached: true,
                                                                                                     pushPath: false,
                                                                                                     path: [
                                                                                                            { tag: 'value',
                                                                                                              value: { value: _descriptor_2.toValue(0n),
                                                                                                                       alignment: _descriptor_2.alignment() } }] } },
                                                                                            { popeq: { cached: true,
                                                                                                       result: undefined } }]).value));
    __compactRuntime.hasCoinCommitment(context, mergedPot_0, tmp_0) ? __compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { idx: { cached: false,
                                                                                                                  pushPath: true,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_2.toValue(1n),
                                                                                                                                    alignment: _descriptor_2.alignment() } }] } },
                                                                                                         { push: { storage: false,
                                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                         { dup: { n: 5 } },
                                                                                                         { push: { storage: false,
                                                                                                                   value: __compactRuntime.StateValue.newCell(__compactRuntime.runtimeCoinCommitment(
                                                                                                                                                                { value: _descriptor_10.toValue(mergedPot_0),
                                                                                                                                                                  alignment: _descriptor_10.alignment() },
                                                                                                                                                                { value: _descriptor_12.toValue(tmp_0),
                                                                                                                                                                  alignment: _descriptor_12.alignment() }
                                                                                                                                                              )).encode() } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_2.toValue(1n),
                                                                                                                                    alignment: _descriptor_2.alignment() } },
                                                                                                                         { tag: 'stack' }] } },
                                                                                                         { push: { storage: false,
                                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(mergedPot_0),
                                                                                                                                                                alignment: _descriptor_10.alignment() }).encode() } },
                                                                                                         { swap: { n: 0 } },
                                                                                                         { concat: { cached: true,
                                                                                                                     n: 91 } },
                                                                                                         { ins: { cached: false,
                                                                                                                  n: 1 } },
                                                                                                         { ins: { cached: true,
                                                                                                                  n: 1 } }]) : (() => { throw new __compactRuntime.CompactError(`proof-or-bluff.compact line 405 char 3: Coin commitment not found. Check the coin has been received (or call 'createZswapOutput')`); })();
    return [];
  }
  _revealSeed_0(context,
                partialProofData,
                matchId_0,
                p1Entropy_0,
                p2Entropy_0,
                startingRank_0,
                currentTime_0)
  {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_22(m_0.phase, 1n),
                            'Match not awaiting seed reveal');
    let t_0;
    __compactRuntime.assert((t_0 = startingRank_0, t_0 <= 12n),
                            'Starting rank out of range');
    __compactRuntime.assert(this._verifyEntropyAgainstCommit_0(p1Entropy_0,
                                                               m_0.p1EntropyCommit),
                            'p1 entropy does not match its commitment');
    __compactRuntime.assert(this._verifyEntropyAgainstCommit_0(p2Entropy_0,
                                                               m_0.p2EntropyCommit),
                            'p2 entropy does not match its commitment');
    const combined_0 = this._persistentHash_1({ separator:
                                                  new Uint8Array([112, 111, 98, 58, 115, 101, 101, 100, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                p1Entropy: p1Entropy_0,
                                                p2Entropy: p2Entropy_0 });
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: combined_0,
                        seedFinalized: true,
                        phase: 2n,
                        activePlayerIdx: 0n,
                        currentRank: startingRank_0,
                        lastActionAt: currentTime_0,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: m_0.hasPendingPlay,
                        challengeCalledAt: m_0.challengeCalledAt,
                        isChallenged: m_0.isChallenged,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: m_0.winner,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _playCards_0(context,
               partialProofData,
               matchId_0,
               playCommit_0,
               claimedRank_0,
               claimedCount_0,
               currentTime_0)
  {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_23(m_0.phase, 2n),
                            'Match not in PLAYING phase');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_24(caller_0, m_0.playerOne)
                            ||
                            this._equal_25(caller_0, m_0.playerTwo),
                            'Not a player');
    const callerIdx_0 = this._equal_26(caller_0, m_0.playerOne) ? 0n : 1n;
    __compactRuntime.assert(this._equal_27(callerIdx_0, m_0.activePlayerIdx),
                            'Not your turn');
    __compactRuntime.assert(this._equal_28(claimedRank_0, m_0.currentRank),
                            'Claimed rank must equal required rank for this turn');
    let t_0, t_1;
    __compactRuntime.assert((t_1 = claimedCount_0, t_1 >= 1n)
                            &&
                            (t_0 = claimedCount_0, t_0 <= 4n),
                            'Must play 1-4 cards');
    const callerHandSize_0 = this._equal_29(callerIdx_0, 0n) ?
                             m_0.p1HandSize :
                             m_0.p2HandSize;
    let t_2;
    __compactRuntime.assert((t_2 = callerHandSize_0, t_2 >= claimedCount_0),
                            'Not enough cards in hand to play claimed count');
    const newP1Hand_0 = this._equal_30(callerIdx_0, 0n) ?
                        this._subWithFloor32_0(m_0.p1HandSize, claimedCount_0) :
                        m_0.p1HandSize;
    const newP2Hand_0 = this._equal_31(callerIdx_0, 1n) ?
                        this._subWithFloor32_0(m_0.p2HandSize, claimedCount_0) :
                        m_0.p2HandSize;
    const nextIdx_0 = this._equal_32(callerIdx_0, 0n) ? 1n : 0n;
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: 3n,
                        activePlayerIdx: nextIdx_0,
                        currentRank: m_0.currentRank,
                        lastActionAt: currentTime_0,
                        lastClaimRank: claimedRank_0,
                        lastClaimCount: claimedCount_0,
                        lastPlayCommit: playCommit_0,
                        lastPlayerIdx: callerIdx_0,
                        hasPendingPlay: true,
                        challengeCalledAt: 0n,
                        isChallenged: false,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: newP1Hand_0,
                        p2HandSize: newP2Hand_0,
                        winner: m_0.winner,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _acceptClaim_0(context, partialProofData, matchId_0, currentTime_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_33(m_0.phase, 3n),
                            'No pending play to accept');
    __compactRuntime.assert(m_0.hasPendingPlay, 'No pending play');
    __compactRuntime.assert(!m_0.isChallenged, 'Play was already challenged');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_34(caller_0, m_0.playerOne)
                            ||
                            this._equal_35(caller_0, m_0.playerTwo),
                            'Not a player');
    const callerIdx_0 = this._equal_36(caller_0, m_0.playerOne) ? 0n : 1n;
    __compactRuntime.assert(!this._equal_37(callerIdx_0, m_0.lastPlayerIdx),
                            'Only the passive player can accept');
    const newPileSize_0 = ((t1) => {
                            if (t1 > 4294967295n) {
                              throw new __compactRuntime.CompactError('proof-or-bluff.compact line 575 char 23: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                            }
                            return t1;
                          })(m_0.pileSize + m_0.lastClaimCount);
    const advancedRank_0 = this._nextRank_0(m_0.currentRank);
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: 2n,
                        activePlayerIdx: callerIdx_0,
                        currentRank: advancedRank_0,
                        lastActionAt: currentTime_0,
                        lastClaimRank: 0n,
                        lastClaimCount: 0n,
                        lastPlayCommit:
                          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                        lastPlayerIdx: 0n,
                        hasPendingPlay: false,
                        challengeCalledAt: 0n,
                        isChallenged: false,
                        pileSize: newPileSize_0,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: m_0.winner,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _challengeClaim_0(context, partialProofData, matchId_0, currentTime_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_38(m_0.phase, 3n),
                            'No pending play to challenge');
    __compactRuntime.assert(m_0.hasPendingPlay, 'No pending play');
    __compactRuntime.assert(!m_0.isChallenged, 'Already challenged');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_39(caller_0, m_0.playerOne)
                            ||
                            this._equal_40(caller_0, m_0.playerTwo),
                            'Not a player');
    const callerIdx_0 = this._equal_41(caller_0, m_0.playerOne) ? 0n : 1n;
    __compactRuntime.assert(!this._equal_42(callerIdx_0, m_0.lastPlayerIdx),
                            'Only the passive player can challenge');
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: m_0.phase,
                        activePlayerIdx: m_0.activePlayerIdx,
                        currentRank: m_0.currentRank,
                        lastActionAt: currentTime_0,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: m_0.hasPendingPlay,
                        challengeCalledAt: currentTime_0,
                        isChallenged: true,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: m_0.winner,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(4n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_9.toValue(tmp_0),
                                                                alignment: _descriptor_9.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _resolveChallenge_0(context, partialProofData, matchId_0, currentTime_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_43(m_0.phase, 3n),
                            'No challenge in progress');
    __compactRuntime.assert(m_0.hasPendingPlay, 'No pending play');
    __compactRuntime.assert(m_0.isChallenged, 'Play was not challenged');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_44(caller_0, m_0.playerOne)
                            ||
                            this._equal_45(caller_0, m_0.playerTwo),
                            'Not a player');
    const callerIdx_0 = this._equal_46(caller_0, m_0.playerOne) ? 0n : 1n;
    __compactRuntime.assert(this._equal_47(callerIdx_0, m_0.lastPlayerIdx),
                            'Only the challenged player can resolve');
    const reveal_0 = this._revealLastPlay_0(context, partialProofData);
    __compactRuntime.assert(this._equal_48(reveal_0.count, m_0.lastClaimCount),
                            'Reveal count mismatches claim');
    const recomputed_0 = this._persistentHash_3(reveal_0);
    __compactRuntime.assert(this._equal_49(recomputed_0, m_0.lastPlayCommit),
                            'Reveal does not match committed play');
    const matchingCount_0 = this._countMatchingRanks_0(reveal_0,
                                                       m_0.lastClaimRank);
    const claimWasTrue_0 = this._equal_50(matchingCount_0, m_0.lastClaimCount);
    const pileToTransfer_0 = ((t1) => {
                               if (t1 > 4294967295n) {
                                 throw new __compactRuntime.CompactError('proof-or-bluff.compact line 708 char 26: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                               }
                               return t1;
                             })(m_0.pileSize + m_0.lastClaimCount);
    const challengerIdx_0 = this._equal_51(m_0.lastPlayerIdx, 0n) ? 1n : 0n;
    const p1TakesPile_0 = claimWasTrue_0 ?
                          this._equal_52(challengerIdx_0, 0n) :
                          this._equal_53(m_0.lastPlayerIdx, 0n);
    const p2TakesPile_0 = claimWasTrue_0 ?
                          this._equal_54(challengerIdx_0, 1n) :
                          this._equal_55(m_0.lastPlayerIdx, 1n);
    const nextP1Hand_0 = p1TakesPile_0 ?
                         ((t1) => {
                           if (t1 > 4294967295n) {
                             throw new __compactRuntime.CompactError('proof-or-bluff.compact line 720 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                           }
                           return t1;
                         })(m_0.p1HandSize + pileToTransfer_0)
                         :
                         m_0.p1HandSize;
    const nextP2Hand_0 = p2TakesPile_0 ?
                         ((t1) => {
                           if (t1 > 4294967295n) {
                             throw new __compactRuntime.CompactError('proof-or-bluff.compact line 723 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                           }
                           return t1;
                         })(m_0.p2HandSize + pileToTransfer_0)
                         :
                         m_0.p2HandSize;
    const p1ScoreDelta_0 = claimWasTrue_0 ?
                           this._equal_56(challengerIdx_0, 0n) ? 0n : 0n :
                           this._equal_57(challengerIdx_0, 0n) ? 3n : 0n;
    const p2ScoreDelta_0 = claimWasTrue_0 ?
                           this._equal_58(challengerIdx_0, 1n) ? 0n : 0n :
                           this._equal_59(challengerIdx_0, 1n) ? 3n : 0n;
    const p1ScorePenalty_0 = claimWasTrue_0
                             &&
                             this._equal_60(challengerIdx_0, 0n)
                             ?
                             1n :
                             0n;
    const p2ScorePenalty_0 = claimWasTrue_0
                             &&
                             this._equal_61(challengerIdx_0, 1n)
                             ?
                             1n :
                             0n;
    const nextP1Score_0 = this._subWithFloor32_0(((t1) => {
                                                   if (t1 > 4294967295n) {
                                                     throw new __compactRuntime.CompactError('proof-or-bluff.compact line 736 char 48: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                                                   }
                                                   return t1;
                                                 })(m_0.p1Score + p1ScoreDelta_0),
                                                 p1ScorePenalty_0);
    const nextP2Score_0 = this._subWithFloor32_0(((t1) => {
                                                   if (t1 > 4294967295n) {
                                                     throw new __compactRuntime.CompactError('proof-or-bluff.compact line 737 char 48: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                                                   }
                                                   return t1;
                                                 })(m_0.p2Score + p2ScoreDelta_0),
                                                 p2ScorePenalty_0);
    const threshAsU32_0 = m_0.winThreshold;
    const emptyHand_0 = this._isEmptyHandMode_0(m_0.mode);
    const p1WinsScore_0 = !emptyHand_0 && nextP1Score_0 >= threshAsU32_0;
    const p2WinsScore_0 = !emptyHand_0 && !p1WinsScore_0
                          &&
                          nextP2Score_0 >= threshAsU32_0;
    const p1WinsEmpty_0 = emptyHand_0 && this._equal_62(nextP1Hand_0, 0n);
    const p2WinsEmpty_0 = emptyHand_0 && !p1WinsEmpty_0
                          &&
                          this._equal_63(nextP2Hand_0, 0n);
    const newWinner_0 = p1WinsScore_0 || p1WinsEmpty_0 ?
                        1n :
                        p2WinsScore_0 || p2WinsEmpty_0 ? 2n : 0n;
    const newCompleted_0 = !this._equal_64(newWinner_0, 0n);
    const newPhase_0 = newCompleted_0 ? 4n : 2n;
    const advancedRank_0 = this._nextRank_0(m_0.currentRank);
    const nextActive_0 = newCompleted_0 ? m_0.activePlayerIdx : challengerIdx_0;
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: newPhase_0,
                        activePlayerIdx: nextActive_0,
                        currentRank: advancedRank_0,
                        lastActionAt: currentTime_0,
                        lastClaimRank: 0n,
                        lastClaimCount: 0n,
                        lastPlayCommit:
                          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                        lastPlayerIdx: 0n,
                        hasPendingPlay: false,
                        challengeCalledAt: 0n,
                        isChallenged: false,
                        pileSize: 0n,
                        p1Score: nextP1Score_0,
                        p2Score: nextP2Score_0,
                        p1HandSize: nextP1Hand_0,
                        p2HandSize: nextP2Hand_0,
                        winner: newWinner_0,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    if (newCompleted_0) {
      const tmp_0 = 1n;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_2.toValue(3n),
                                                                    alignment: _descriptor_2.alignment() } }] } },
                                         { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                                { value: _descriptor_9.toValue(tmp_0),
                                                                  alignment: _descriptor_9.alignment() }
                                                                  .value
                                                              )) } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    return claimWasTrue_0;
  }
  _forfeitStalledChallenge_0(context,
                             partialProofData,
                             matchId_0,
                             currentTime_0,
                             timeoutSeconds_0)
  {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(m_0.isChallenged, 'No challenge in progress');
    __compactRuntime.assert(m_0.hasPendingPlay, 'No pending play');
    let t_0;
    __compactRuntime.assert((t_0 = currentTime_0,
                             t_0
                             >=
                             ((t1) => {
                               if (t1 > 18446744073709551615n) {
                                 throw new __compactRuntime.CompactError('proof-or-bluff.compact line 814 char 44: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                               }
                               return t1;
                             })(m_0.challengeCalledAt + timeoutSeconds_0)),
                            'Challenge window still open');
    const challengerIdx_0 = this._equal_65(m_0.lastPlayerIdx, 0n) ? 1n : 0n;
    const pileToTransfer_0 = ((t1) => {
                               if (t1 > 4294967295n) {
                                 throw new __compactRuntime.CompactError('proof-or-bluff.compact line 818 char 26: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                               }
                               return t1;
                             })(m_0.pileSize + m_0.lastClaimCount);
    const nextP1Hand_0 = this._equal_66(m_0.lastPlayerIdx, 0n) ?
                         ((t1) => {
                           if (t1 > 4294967295n) {
                             throw new __compactRuntime.CompactError('proof-or-bluff.compact line 821 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                           }
                           return t1;
                         })(m_0.p1HandSize + pileToTransfer_0)
                         :
                         m_0.p1HandSize;
    const nextP2Hand_0 = this._equal_67(m_0.lastPlayerIdx, 1n) ?
                         ((t1) => {
                           if (t1 > 4294967295n) {
                             throw new __compactRuntime.CompactError('proof-or-bluff.compact line 824 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                           }
                           return t1;
                         })(m_0.p2HandSize + pileToTransfer_0)
                         :
                         m_0.p2HandSize;
    const nextP1Score_0 = this._equal_68(challengerIdx_0, 0n) ?
                          ((t1) => {
                            if (t1 > 4294967295n) {
                              throw new __compactRuntime.CompactError('proof-or-bluff.compact line 828 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                            }
                            return t1;
                          })(m_0.p1Score + 3n)
                          :
                          m_0.p1Score;
    const nextP2Score_0 = this._equal_69(challengerIdx_0, 1n) ?
                          ((t1) => {
                            if (t1 > 4294967295n) {
                              throw new __compactRuntime.CompactError('proof-or-bluff.compact line 831 char 7: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                            }
                            return t1;
                          })(m_0.p2Score + 3n)
                          :
                          m_0.p2Score;
    const threshAsU32_0 = m_0.winThreshold;
    const emptyHand_0 = this._isEmptyHandMode_0(m_0.mode);
    const p1WinsScore_0 = !emptyHand_0 && nextP1Score_0 >= threshAsU32_0;
    const p2WinsScore_0 = !emptyHand_0 && !p1WinsScore_0
                          &&
                          nextP2Score_0 >= threshAsU32_0;
    const newWinner_0 = p1WinsScore_0 ? 1n : p2WinsScore_0 ? 2n : 0n;
    const newCompleted_0 = !this._equal_70(newWinner_0, 0n);
    const newPhase_0 = newCompleted_0 ? 4n : 2n;
    const advancedRank_0 = this._nextRank_0(m_0.currentRank);
    const nextActive_0 = newCompleted_0 ? m_0.activePlayerIdx : challengerIdx_0;
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: newPhase_0,
                        activePlayerIdx: nextActive_0,
                        currentRank: advancedRank_0,
                        lastActionAt: currentTime_0,
                        lastClaimRank: 0n,
                        lastClaimCount: 0n,
                        lastPlayCommit:
                          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                        lastPlayerIdx: 0n,
                        hasPendingPlay: false,
                        challengeCalledAt: 0n,
                        isChallenged: false,
                        pileSize: 0n,
                        p1Score: nextP1Score_0,
                        p2Score: nextP2Score_0,
                        p1HandSize: nextP1Hand_0,
                        p2HandSize: nextP2Hand_0,
                        winner: newWinner_0,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    if (newCompleted_0) {
      const tmp_0 = 1n;
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_2.toValue(3n),
                                                                    alignment: _descriptor_2.alignment() } }] } },
                                         { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                                { value: _descriptor_9.toValue(tmp_0),
                                                                  alignment: _descriptor_9.alignment() }
                                                                  .value
                                                              )) } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    return [];
  }
  _cancelUnjoinedMatch_0(context, partialProofData, matchId_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_71(m_0.phase, 0n),
                            'Match already joined');
    __compactRuntime.assert(!m_0.escrowReleased, 'Escrow already released');
    __compactRuntime.assert(m_0.potHasCoin, 'Match pot already released');
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(1n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match pot not found');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    __compactRuntime.assert(this._equal_72(caller_0, m_0.playerOne),
                            'Only creator can cancel');
    const pot_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_2.toValue(1n),
                                                                                                        alignment: _descriptor_2.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    this._sendShielded_0(context,
                         partialProofData,
                         pot_0,
                         this._left_0(m_0.playerOne),
                         pot_0.value);
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: 4n,
                        activePlayerIdx: m_0.activePlayerIdx,
                        currentRank: m_0.currentRank,
                        lastActionAt: m_0.lastActionAt,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: m_0.hasPendingPlay,
                        challengeCalledAt: m_0.challengeCalledAt,
                        isChallenged: m_0.isChallenged,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: 0n,
                        escrowReleased: true,
                        potHasCoin: false };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _forfeitAbandonedMatch_0(context,
                           partialProofData,
                           matchId_0,
                           currentTime_0,
                           timeoutSeconds_0)
  {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_73(m_0.phase, 2n),
                            'Match not in PLAYING');
    __compactRuntime.assert(!m_0.hasPendingPlay,
                            'Pending play must use challenge timeout');
    __compactRuntime.assert(!m_0.escrowReleased, 'Escrow already released');
    __compactRuntime.assert(m_0.potHasCoin, 'Match pot already released');
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(1n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match pot not found');
    let t_0;
    __compactRuntime.assert((t_0 = currentTime_0,
                             t_0
                             >=
                             ((t1) => {
                               if (t1 > 18446744073709551615n) {
                                 throw new __compactRuntime.CompactError('proof-or-bluff.compact line 960 char 44: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                               }
                               return t1;
                             })(m_0.lastActionAt + timeoutSeconds_0)),
                            'Abandonment window still open');
    const forfeitingIdx_0 = m_0.activePlayerIdx;
    const newWinner_0 = this._equal_74(forfeitingIdx_0, 0n) ? 2n : 1n;
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: 4n,
                        activePlayerIdx: m_0.activePlayerIdx,
                        currentRank: m_0.currentRank,
                        lastActionAt: currentTime_0,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: false,
                        challengeCalledAt: 0n,
                        isChallenged: false,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: newWinner_0,
                        escrowReleased: m_0.escrowReleased,
                        potHasCoin: m_0.potHasCoin };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(3n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_9.toValue(tmp_0),
                                                                alignment: _descriptor_9.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _claimPayout_0(context, partialProofData, matchId_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    const m_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_2.toValue(0n),
                                                                                                      alignment: _descriptor_2.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(this._equal_75(m_0.phase, 4n),
                            'Match not in GAMEOVER');
    __compactRuntime.assert(!this._equal_76(m_0.winner, 0n), 'Winner not set');
    __compactRuntime.assert(!m_0.escrowReleased, 'Payout already claimed');
    __compactRuntime.assert(m_0.potHasCoin, 'Match pot already released');
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(1n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match pot not found');
    const caller_0 = this._ownPublicKey_0(context, partialProofData);
    const expected_0 = this._equal_77(m_0.winner, 1n) ?
                       m_0.playerOne :
                       m_0.playerTwo;
    __compactRuntime.assert(this._equal_78(caller_0, expected_0),
                            'Only the winner can claim');
    const pot_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                            partialProofData,
                                                                            [
                                                                             { dup: { n: 0 } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_2.toValue(1n),
                                                                                                        alignment: _descriptor_2.alignment() } }] } },
                                                                             { idx: { cached: false,
                                                                                      pushPath: false,
                                                                                      path: [
                                                                                             { tag: 'value',
                                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                                             { popeq: { cached: false,
                                                                                        result: undefined } }]).value);
    this._sendShielded_0(context,
                         partialProofData,
                         pot_0,
                         this._left_0(expected_0),
                         pot_0.value);
    const updated_0 = { playerOne: m_0.playerOne,
                        playerTwo: m_0.playerTwo,
                        mode: m_0.mode,
                        winThreshold: m_0.winThreshold,
                        wagerAmount: m_0.wagerAmount,
                        createdAt: m_0.createdAt,
                        p1EntropyCommit: m_0.p1EntropyCommit,
                        p2EntropyCommit: m_0.p2EntropyCommit,
                        combinedSeed: m_0.combinedSeed,
                        seedFinalized: m_0.seedFinalized,
                        phase: m_0.phase,
                        activePlayerIdx: m_0.activePlayerIdx,
                        currentRank: m_0.currentRank,
                        lastActionAt: m_0.lastActionAt,
                        lastClaimRank: m_0.lastClaimRank,
                        lastClaimCount: m_0.lastClaimCount,
                        lastPlayCommit: m_0.lastPlayCommit,
                        lastPlayerIdx: m_0.lastPlayerIdx,
                        hasPendingPlay: m_0.hasPendingPlay,
                        challengeCalledAt: m_0.challengeCalledAt,
                        isChallenged: m_0.isChallenged,
                        pileSize: m_0.pileSize,
                        p1Score: m_0.p1Score,
                        p2Score: m_0.p2Score,
                        p1HandSize: m_0.p1HandSize,
                        p2HandSize: m_0.p2HandSize,
                        winner: m_0.winner,
                        escrowReleased: true,
                        potHasCoin: false };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(0n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(updated_0),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_2.toValue(1n),
                                                                  alignment: _descriptor_2.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _getMatch_0(context, partialProofData, matchId_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_2.toValue(0n),
                                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _getMatchPhase_0(context, partialProofData, matchId_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_2.toValue(0n),
                                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value).phase;
  }
  _getWinner_0(context, partialProofData, matchId_0) {
    __compactRuntime.assert(_descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Match not found');
    return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_2.toValue(0n),
                                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value).winner;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_17(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_18(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_19(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_20(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_21(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_22(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_23(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_24(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_25(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_26(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_27(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_28(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_29(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_30(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_31(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_32(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_33(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_34(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_35(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_36(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_37(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_38(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_39(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_40(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_41(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_42(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_43(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_44(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_45(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_46(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_47(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_48(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_49(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_50(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_51(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_52(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_53(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_54(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_55(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_56(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_57(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_58(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_59(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_60(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_61(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_62(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_63(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_64(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_65(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_66(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_67(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_68(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_69(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_70(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_71(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_72(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_73(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_74(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_75(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_76(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_77(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_78(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    matches: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'proof-or-bluff.compact line 191 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'proof-or-bluff.compact line 191 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(0n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    matchPots: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'proof-or-bluff.compact line 192 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'proof-or-bluff.compact line 192 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(1n),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get totalMatchesCreated() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get totalMatchesCompleted() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(3n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get totalChallengesIssued() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(4n),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ revealLastPlay: (...args) => undefined });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
