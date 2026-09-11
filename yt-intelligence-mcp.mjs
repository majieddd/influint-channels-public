#!/usr/bin/env node
/**
 * Influint channel intelligence, as an MCP server.
 *
 * Download this one file, set two environment variables, point any MCP client
 * at it. It proxies to the read-only HTTP API, so what it can do is exactly
 * what a key is allowed to read: look at the evidence base and one channel's
 * prioritised actions. It cannot start an analysis, publish anything, or move
 * a claim's standing.
 *
 * ZERO DEPENDENCIES, and that is the whole point. The MCP stdio transport is
 * newline-delimited JSON-RPC 2.0, which is about a hundred lines to speak
 * directly. Depending on the SDK would mean an npm install, a version to pin
 * and a lockfile to go wrong on someone else's machine, in exchange for
 * nothing this file needs. Node 18 or newer is the only requirement (it uses
 * the built-in fetch).
 *
 * THE TOOL TABLE BELOW IS GENERATED and must not be hand-edited. It is one
 * rendering of `src/lib/intelligence/tools.ts`, the same table the HTTP route
 * and the client documents render, so the four hand-written lists that used to
 * describe these tools cannot drift apart again. This file cannot import that
 * module — TypeScript, a path alias and a bundler are the three things its
 * design refuses — and it must not fetch the table at startup either, because
 * then an offline or unconfigured connector would publish NO tools, which is a
 * worse failure than a stale list and an invisible one. So the table is
 * generated in, and a test regenerates it and fails on any difference:
 *
 *   npx vitest run tests/intelligence/tools.test.ts          # checks it
 *   UPDATE_CONNECTOR=1 npx vitest run tests/intelligence/tools.test.ts   # rewrites it
 *
 *   YT_INTELLIGENCE_URL=https://<host>/api/intelligence \
 *   YT_INTELLIGENCE_KEY=<key> \
 *   node yt-intelligence-mcp.mjs
 *
 * Claude Desktop / Claude Code config:
 *
 *   {
 *     "mcpServers": {
 *       "yt-intelligence": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/yt-intelligence-mcp.mjs"],
 *         "env": {
 *           "YT_INTELLIGENCE_URL": "https://<host>/api/intelligence",
 *           "YT_INTELLIGENCE_KEY": "<key>"
 *         }
 *       }
 *     }
 *   }
 */

const BASE = (process.env.YT_INTELLIGENCE_URL || "").replace(/\/+$/, "");
const KEY = process.env.YT_INTELLIGENCE_KEY || "";
const NAME = "yt-intelligence";
const VERSION = "1.2.0";
const DEFAULT_PROTOCOL = "2024-11-05";

/**
 * Every tool description says what the answer RESTS ON, not just what it
 * returns — including its caps and their defaults, which are composed from the
 * same numbers the server validates against. A model told "the claims for this
 * niche" will state them as fact; one told "most of these have never been
 * measured, and each carries how well it has held up" will pass that on. The
 * whole system is built to avoid handing over a number without its basis, and
 * this is the last place it can be dropped.
 *
 * `outputSchema` is here so an agent writing a SCRIPT against these tools knows
 * the field names without parsing a string and guessing. It is deliberately not
 * closed: a client that validated `structuredContent` strictly would otherwise
 * fail the whole call the first time the server adds a field.
 */
// ── BEGIN GENERATED TOOL TABLE ─────────────────────────────────────────────
const TOOLS = [
  {
    "name": "intelligence_state",
    "canonicalName": "state",
    "category": "orient",
    "path": "state",
    "description": "How much of the YouTube knowledge base is actually measured, how many claims share a single test, and what is waiting on a human decision. It also carries, in plain words, what the probe battery can and cannot measure. Call this first: it is the cheapest way to know what the rest of the answers are worth.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "standings": {
          "type": "object",
          "description": "Live claims per standing: law, candidate-law, theory, warning, rejected.",
          "additionalProperties": {
            "type": "number"
          }
        },
        "claims": {
          "type": "number",
          "description": "Live claims on the store, merged duplicates excluded."
        },
        "bound": {
          "type": "number",
          "description": "Claims bound to a probe, so a run can measure them."
        },
        "measured": {
          "type": "number",
          "description": "Claims carrying at least one reading."
        },
        "independentlyMeasured": {
          "type": "number",
          "description": "Measured claims that do not share their test with another claim."
        },
        "sharingATest": {
          "type": "number",
          "description": "Claims riding a probe another claim also rides. A tally of measured claims counts these more than once."
        },
        "settledContradictions": {
          "type": "number",
          "description": "Pairs bound to one probe in opposite directions where the ledger settled which holds."
        },
        "openForAHuman": {
          "type": "number",
          "description": "Queued items only a person may settle."
        },
        "reach": {
          "type": "string",
          "description": "What the probe battery can and cannot measure, and how much of the store carries any measurement at all. Rendered from the lists beside the battery, not written for this answer."
        },
        "generatedAt": {
          "type": "string"
        }
      },
      "required": [
        "standings",
        "claims",
        "bound",
        "measured",
        "reach",
        "generatedAt"
      ],
      "description": "One object of counts, plus the sentence saying what is measurable at all."
    }
  },
  {
    "name": "intelligence_catalogue",
    "canonicalName": "catalogue",
    "category": "channels",
    "path": "catalogue",
    "description": "The whole opening of a session in one call: how much of the store is measured and what the probe battery reaches, every channel in the knowledge base, and the register of workflows saying how a claim may be applied. It returns each of those three answers exactly as its own tool returns it — nothing here is summarised or trimmed, so what you get is the three calls, not a digest of them. Start here; then use `vocabulary` for the legal values of every parameter.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "state": {
          "type": "object",
          "description": "Exactly what the state tool returns; that tool's output schema names every field.",
          "properties": {
            "reach": {
              "type": "string",
              "description": "What the probe battery can and cannot measure, and how much of the store carries any measurement at all. Rendered from the lists beside the battery, not written for this answer."
            },
            "claims": {
              "type": "number",
              "description": "Live claims on the store, merged duplicates excluded."
            },
            "measured": {
              "type": "number",
              "description": "Claims carrying at least one reading."
            }
          }
        },
        "channels": {
          "type": "array",
          "description": "Exactly what the channels tool returns, largest catalogue first.",
          "items": {
            "type": "object",
            "properties": {
              "channelId": {
                "type": "string"
              },
              "name": {
                "type": "string",
                "description": "Its name, or the id when nothing has measured it yet."
              },
              "niche": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "The marketplace, only when a HUMAN confirmed it. A proposal tags nothing and reads as null."
              },
              "scaleBand": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "videos": {
                "type": "number",
                "description": "Uploads in the catalogue."
              },
              "measurableVideos": {
                "type": "number",
                "description": "Uploads a probe can read, usually fewer."
              }
            },
            "required": [
              "channelId",
              "name",
              "videos"
            ]
          }
        },
        "workflows": {
          "type": "array",
          "description": "Exactly what the workflows tool returns.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Pass this to the workflow tool."
              },
              "name": {
                "type": "string"
              },
              "department": {
                "type": "string",
                "description": "Which deliverable it belongs to."
              },
              "question": {
                "type": "string",
                "description": "The one question it answers."
              },
              "looksAt": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "What it reads."
              },
              "applies": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "The application modes it is permitted: rule, prior, hypothesis, prohibition, do-not-repeat. Anything else is filtered out."
              },
              "produces": {
                "type": "string"
              },
              "writesBack": {
                "type": "string",
                "description": "What it records so the next workflow starts further along."
              },
              "neverDoes": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Prohibitions on the workflow itself, not on the advice."
              },
              "entry": {
                "type": "string",
                "description": "Where it is started from: a route, an npm script, a page or a file."
              },
              "status": {
                "type": "string",
                "description": "`planned` when it is not implemented yet — a stated gap, never a claim."
              }
            },
            "required": [
              "id",
              "name",
              "question",
              "applies",
              "produces"
            ]
          }
        }
      },
      "required": [
        "state",
        "channels",
        "workflows"
      ],
      "description": "The state answer, the channel list and the workflow register, verbatim."
    }
  },
  {
    "name": "intelligence_vocabulary",
    "canonicalName": "vocabulary",
    "category": "orient",
    "path": "vocabulary",
    "description": "The legal values for every parameter in this API, read from the store rather than asserted: the standings and the only modes each may be applied in, the claim categories present, the marketplaces claims are scoped to BESIDE the marketplaces channels are confirmed in (they are different sets, and the difference decides whether passing a niche reaches anything), the probe ids with how many claims each carries, the unit nouns, the ladder's own thresholds, and every cap with its default and the field it reports itself in. Read this before guessing a value: a value outside a closed vocabulary is refused with its reason, and an open one is answered with a routing line saying what it actually reached.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "standings": {
          "type": "array",
          "description": "The rungs of the evidence ladder, with how many live claims sit on each.",
          "items": {
            "type": "object",
            "properties": {
              "standing": {
                "type": "string",
                "description": "A rung on the evidence ladder, and the legal values of the `standing` parameter. It moves DOWN as well as up."
              },
              "claims": {
                "type": "number"
              },
              "appliedAs": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "The ONLY application modes this standing may reach a workflow in. A theory can never arrive as a rule."
              },
              "terminal": {
                "type": "boolean",
                "description": "Nothing moves off this rung by measurement alone."
              },
              "means": {
                "type": "string",
                "description": "What the rung means, with every number in it taken from the constant that applies it."
              }
            },
            "required": [
              "standing",
              "claims",
              "appliedAs",
              "means"
            ]
          }
        },
        "rejectionTypes": {
          "type": "array",
          "description": "How the refuted claims died. One standing, three reasons, because the remedy differs.",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              },
              "claims": {
                "type": "number"
              }
            }
          }
        },
        "categories": {
          "type": "array",
          "description": "Claim categories present in the store, commonest first. The legal values of the `category` parameter as it stands today.",
          "items": {
            "type": "object",
            "properties": {
              "category": {
                "type": "string"
              },
              "claims": {
                "type": "number"
              }
            }
          }
        },
        "niches": {
          "type": "object",
          "description": "The two niche vocabularies, kept apart on purpose.",
          "properties": {
            "inClaims": {
              "type": "array",
              "description": "Marketplaces live claims are SCOPED to. Passing one of these routes to something.",
              "items": {
                "type": "object",
                "properties": {
                  "niche": {
                    "type": "string",
                    "description": "A marketplace at least one claim is scoped to. A legal value of the `niche` parameter that reaches niched claims."
                  },
                  "claims": {
                    "type": "number"
                  }
                }
              }
            },
            "confirmedForChannels": {
              "type": "array",
              "description": "Marketplaces a PERSON confirmed for a channel, with how many niched claims each reaches. A zero there is coverage, not a verdict.",
              "items": {
                "type": "object",
                "properties": {
                  "niche": {
                    "type": "string",
                    "description": "A marketplace confirmed for at least one channel. Legal as a `niche` value, and it may still reach no niched claim."
                  },
                  "channels": {
                    "type": "number"
                  },
                  "nichedClaims": {
                    "type": "number"
                  }
                }
              }
            },
            "dialects": {
              "type": "object",
              "description": "Spellings canonicalised on the way in, so a caller can do it first. `woodworking` becomes `maker-build`.",
              "additionalProperties": {
                "type": "string"
              }
            },
            "note": {
              "type": "string",
              "description": "How far the two lists diverge, counted. This is the difference between a niche that routes to nothing because it is misspelled and one that routes to nothing because that marketplace has never been measured."
            }
          }
        },
        "probes": {
          "type": "array",
          "description": "The battery. `boundClaims` is how many live claims are bound to each; a probe bound to none has measured nothing.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "question": {
                "type": "string",
                "description": "Worded on the probe's own axis, which is not always the direction a claim asserts."
              },
              "statistic": {
                "type": "string"
              },
              "minN": {
                "type": "number",
                "description": "Below this many videos it returns nothing at all, because silence is the honest answer."
              },
              "boundClaims": {
                "type": "number"
              }
            }
          }
        },
        "units": {
          "type": "array",
          "description": "What a count of units is CALLED. Three readings from one crawl are three niche corpora, not three channels.",
          "items": {
            "type": "object",
            "properties": {
              "unit": {
                "type": "string"
              },
              "one": {
                "type": "string"
              },
              "many": {
                "type": "string"
              }
            }
          }
        },
        "caps": {
          "type": "array",
          "description": "Every capping parameter in this API, its default, and the field the answer reports its omission in. There is no silent cap here.",
          "items": {
            "type": "object",
            "properties": {
              "tool": {
                "type": "string"
              },
              "parameter": {
                "type": "string"
              },
              "caps": {
                "type": "string"
              },
              "default": {
                "type": "number"
              },
              "reportedIn": {
                "type": "string",
                "description": "The field in that tool's answer naming what the cap dropped."
              }
            }
          }
        },
        "thresholds": {
          "type": "object",
          "description": "The numbers the ladder actually applies, from the constants that apply them.",
          "properties": {
            "channelsForCandidateLaw": {
              "type": "number",
              "description": "Independent channel readings needed before the data may promote — or reject."
            },
            "minConsistency": {
              "type": "number",
              "description": "Below this, with enough channels, the data refutes a claim."
            },
            "consistencyForLaw": {
              "type": "number",
              "description": "A signed law falling below this drops back to candidate-law."
            }
          }
        },
        "refusals": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Which parameters are refused on an unknown value and which are not, and why. An open vocabulary is open because refusing against a partial list would reject valid values."
        }
      },
      "required": [
        "standings",
        "categories",
        "niches",
        "probes",
        "caps",
        "thresholds",
        "refusals"
      ],
      "description": "The legal values of every parameter, the ladder's thresholds, the caps, and the refusal rules."
    }
  },
  {
    "name": "intelligence_claims",
    "canonicalName": "claims",
    "category": "claims",
    "path": "claims",
    "description": "What we believe about YouTube performance, routed to a channel's niche, together with the PROHIBITIONS — things our own data refuted and nobody should assert. Each claim carries its standing and, when it has been measured, how consistently it held and across how many independent units. Claims scoped to a different niche are excluded; with no niche the answer says so and every niched line is evidence from elsewhere rather than a finding about your channel. `limit` caps how many claims come back (default 60); `prohibitionLimit` caps how many refuted claims come back (default 25). Whatever a cap left out is named in `omitted`.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "niche": {
          "type": "string",
          "description": "The channel's marketplace, e.g. maker-build, vlog-lifestyle, true-crime. Dialects are canonicalised (woodworking becomes maker-build). Open: the legal set is the niches the store actually carries, which this table cannot enumerate without reading it — the vocabulary tool does. An unknown niche is NOT refused, because most confirmed marketplaces carry no niched claim and refusing would reject valid ones; it matches nothing niched and the `routing` line on the answer says so in those words."
        },
        "category": {
          "type": "string",
          "description": "One claim category, e.g. retention, packaging, ideation, production. Open: the legal set is the categories present in the store, which the vocabulary tool lists with a count each. An unknown one is not refused — the `routing` line says no claim carries it, which is worth reading, because an unmatched category empties the prohibitions too."
        },
        "standing": {
          "type": "string",
          "description": "Return only claims at one rung of the evidence ladder. One of: law, candidate-law, warning, theory.",
          "enum": [
            "law",
            "candidate-law",
            "warning",
            "theory"
          ]
        },
        "measuredOnly": {
          "type": "boolean",
          "description": "Only claims with a reading behind them. Accepts true/1/yes or false/0/no; anything else is refused. Default false.",
          "default": false
        },
        "limit": {
          "type": "number",
          "description": "How many claims come back. Default 60.",
          "default": 60,
          "minimum": 1
        },
        "prohibitionLimit": {
          "type": "number",
          "description": "How many refuted claims come back. Separate from `limit`, which never reached them: on the live store 15 of 40 were unreachable at any `limit` until this parameter existed. Default 25.",
          "default": 25,
          "minimum": 1
        }
      },
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "routing": {
          "type": "string",
          "description": "Which claims this answer covers and which it excluded, given the niche you passed or did not pass."
        },
        "claims": {
          "type": "array",
          "description": "The matching claims, best-evidenced first.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Pass it to the claim-evidence tool."
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder: theory, candidate-law, law, warning, rejected. It moves DOWN as well as up."
              },
              "category": {
                "type": "string"
              },
              "scope": {
                "type": "string",
                "description": "general or niched."
              },
              "niche": {
                "type": "string",
                "description": "The marketplace it is scoped to, when it is niched."
              },
              "signed": {
                "type": "boolean",
                "description": "A person put their name to it. A signature is not a measurement."
              },
              "measured": {
                "type": "boolean",
                "description": "At least one reading exists and the grade is not untested."
              },
              "contested": {
                "type": "object",
                "description": "Present when the claim is in a live dispute. Do not state it as settled.",
                "properties": {
                  "nature": {
                    "type": "string"
                  },
                  "discriminatingQuestion": {
                    "type": "string",
                    "description": "The question that would settle it."
                  }
                }
              },
              "evidence": {
                "type": "object",
                "description": "Present only when the claim has been measured. Absent means nobody has quantified it, which is not the same as it being false.",
                "properties": {
                  "heldPct": {
                    "type": "number",
                    "description": "Share of readings where the claim's own predicted direction held."
                  },
                  "observations": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things those readings rest on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is — channels, niches. Never assumed: three readings from one crawl are not three channels."
                  },
                  "grade": {
                    "type": "string",
                    "description": "How much the evidence supports ACTING: untested, weak, moderate, strong."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support: none, correlation, consistent, dose-response, temporal, intervention. Earned by the DESIGN of the test, never read off the effect size."
                  },
                  "statistic": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "The statistic the figure is in. Effects are never averaged across statistics."
                  },
                  "medianEffect": {
                    "type": "number",
                    "description": "In the statistic named above."
                  }
                }
              },
              "secondBasis": {
                "type": "object",
                "description": "The other views basis (launch window vs lifetime accrual), when it has anything to say. Never pooled with the first.",
                "properties": {
                  "reading": {
                    "type": "string"
                  },
                  "note": {
                    "type": "string"
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "category",
              "scope",
              "signed",
              "measured"
            ]
          }
        },
        "prohibitions": {
          "type": "array",
          "description": "Claims our own data refuted. They travel with every answer because they are the most valuable thing here and the easiest to leave behind.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Pass it to the claim-evidence tool."
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder: theory, candidate-law, law, warning, rejected. It moves DOWN as well as up."
              },
              "category": {
                "type": "string"
              },
              "scope": {
                "type": "string",
                "description": "general or niched."
              },
              "niche": {
                "type": "string",
                "description": "The marketplace it is scoped to, when it is niched."
              },
              "signed": {
                "type": "boolean",
                "description": "A person put their name to it. A signature is not a measurement."
              },
              "measured": {
                "type": "boolean",
                "description": "At least one reading exists and the grade is not untested."
              },
              "contested": {
                "type": "object",
                "description": "Present when the claim is in a live dispute. Do not state it as settled.",
                "properties": {
                  "nature": {
                    "type": "string"
                  },
                  "discriminatingQuestion": {
                    "type": "string",
                    "description": "The question that would settle it."
                  }
                }
              },
              "evidence": {
                "type": "object",
                "description": "Present only when the claim has been measured. Absent means nobody has quantified it, which is not the same as it being false.",
                "properties": {
                  "heldPct": {
                    "type": "number",
                    "description": "Share of readings where the claim's own predicted direction held."
                  },
                  "observations": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things those readings rest on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is — channels, niches. Never assumed: three readings from one crawl are not three channels."
                  },
                  "grade": {
                    "type": "string",
                    "description": "How much the evidence supports ACTING: untested, weak, moderate, strong."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support: none, correlation, consistent, dose-response, temporal, intervention. Earned by the DESIGN of the test, never read off the effect size."
                  },
                  "statistic": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "description": "The statistic the figure is in. Effects are never averaged across statistics."
                  },
                  "medianEffect": {
                    "type": "number",
                    "description": "In the statistic named above."
                  }
                }
              },
              "secondBasis": {
                "type": "object",
                "description": "The other views basis (launch window vs lifetime accrual), when it has anything to say. Never pooled with the first.",
                "properties": {
                  "reading": {
                    "type": "string"
                  },
                  "note": {
                    "type": "string"
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "category",
              "scope",
              "signed",
              "measured"
            ]
          }
        },
        "omitted": {
          "type": "string",
          "description": "Present only when something was dropped. Names the count, the whole set it came from, and the parameter that reaches it."
        }
      },
      "required": [
        "routing",
        "claims",
        "prohibitions"
      ],
      "description": "The matching claims, the prohibitions that travel with every answer, and a line naming anything a cap dropped."
    }
  },
  {
    "name": "intelligence_claim_evidence",
    "canonicalName": "claim",
    "category": "claims",
    "path": "claim",
    "description": "Everything measured about ONE claim: the probe that tested it, every per-unit reading, the breakdown by niche, and an explicit list of what the evidence does NOT establish. The readings listed are the ones the FIGURES rest on, not every row on the record. Use this before repeating a claim as fact.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The claim id, from the claims tool. Required."
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Pass it to the claim-evidence tool."
        },
        "claim": {
          "type": "string"
        },
        "standing": {
          "type": "string",
          "description": "Its rung on the evidence ladder: theory, candidate-law, law, warning, rejected. It moves DOWN as well as up."
        },
        "category": {
          "type": "string"
        },
        "scope": {
          "type": "string",
          "description": "general or niched."
        },
        "niche": {
          "type": "string",
          "description": "The marketplace it is scoped to, when it is niched."
        },
        "signed": {
          "type": "boolean",
          "description": "A person put their name to it. A signature is not a measurement."
        },
        "measured": {
          "type": "boolean",
          "description": "At least one reading exists and the grade is not untested."
        },
        "contested": {
          "type": "object",
          "description": "Present when the claim is in a live dispute. Do not state it as settled.",
          "properties": {
            "nature": {
              "type": "string"
            },
            "discriminatingQuestion": {
              "type": "string",
              "description": "The question that would settle it."
            }
          }
        },
        "evidence": {
          "type": "object",
          "description": "Present only when the claim has been measured. Absent means nobody has quantified it, which is not the same as it being false.",
          "properties": {
            "heldPct": {
              "type": "number",
              "description": "Share of readings where the claim's own predicted direction held."
            },
            "observations": {
              "type": "number"
            },
            "units": {
              "type": "number",
              "description": "How many INDEPENDENT things those readings rest on."
            },
            "unitNoun": {
              "type": "string",
              "description": "What kind of thing a unit is — channels, niches. Never assumed: three readings from one crawl are not three channels."
            },
            "grade": {
              "type": "string",
              "description": "How much the evidence supports ACTING: untested, weak, moderate, strong."
            },
            "causalRung": {
              "type": "string",
              "description": "What kind of claim the evidence can support: none, correlation, consistent, dose-response, temporal, intervention. Earned by the DESIGN of the test, never read off the effect size."
            },
            "statistic": {
              "type": [
                "string",
                "null"
              ],
              "description": "The statistic the figure is in. Effects are never averaged across statistics."
            },
            "medianEffect": {
              "type": "number",
              "description": "In the statistic named above."
            }
          }
        },
        "secondBasis": {
          "type": "object",
          "description": "The other views basis (launch window vs lifetime accrual), when it has anything to say. Never pooled with the first.",
          "properties": {
            "reading": {
              "type": "string"
            },
            "note": {
              "type": "string"
            }
          }
        },
        "probe": {
          "type": "object",
          "description": "The probe the claim is bound to. Absent when nothing measures it.",
          "properties": {
            "id": {
              "type": "string"
            },
            "question": {
              "type": "string",
              "description": "The question it asks, worded on its own axis."
            },
            "statistic": {
              "type": "string"
            },
            "minN": {
              "type": "number",
              "description": "Below this many videos it returns nothing, because silence is the honest answer."
            }
          }
        },
        "perUnit": {
          "type": "array",
          "description": "One row per independent unit, counting only the readings the figures rest on.",
          "items": {
            "type": "object",
            "properties": {
              "unit": {
                "type": "string",
                "description": "The channel or niche it came from."
              },
              "heldPct": {
                "type": "number",
                "description": "100 when the claim's direction held here, 0 when it did not."
              },
              "observations": {
                "type": "number"
              },
              "effect": {
                "type": "number"
              }
            }
          }
        },
        "byNiche": {
          "type": "array",
          "description": "The same evidence partitioned by marketplace. A stratum below the floor gets a count and NO figure, which is neither untested nor quotable.",
          "items": {
            "type": "object",
            "properties": {
              "niche": {
                "type": "string",
                "description": "The marketplace this row partitions on."
              },
              "channels": {
                "type": "number"
              },
              "heldPct": {
                "type": [
                  "number",
                  "null"
                ],
                "description": "Null when the stratum is below the floor."
              },
              "belowFloor": {
                "type": "boolean",
                "description": "Too little here to put a figure on."
              }
            }
          }
        },
        "limits": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "What this claim does NOT establish, generated from its own record. Read it before repeating the claim as fact."
        }
      },
      "required": [
        "id",
        "claim",
        "standing",
        "category",
        "scope",
        "signed",
        "measured",
        "perUnit",
        "byNiche",
        "limits"
      ],
      "description": "The claim, its probe, every counted reading, the niche split, and its limits."
    }
  },
  {
    "name": "list_channels",
    "canonicalName": "channels",
    "category": "channels",
    "path": "channels",
    "description": "Every channel in the knowledge base, with its niche, scale band and how deeply it has been analysed. `measurableVideos` is how many of its uploads a probe can actually read, which is usually fewer than its catalogue.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "channels": {
          "type": "array",
          "description": "One row per channel, largest catalogue first.",
          "items": {
            "type": "object",
            "properties": {
              "channelId": {
                "type": "string"
              },
              "name": {
                "type": "string",
                "description": "Its name, or the id when nothing has measured it yet."
              },
              "niche": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "The marketplace, only when a HUMAN confirmed it. A proposal tags nothing and reads as null."
              },
              "scaleBand": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "videos": {
                "type": "number",
                "description": "Uploads in the catalogue."
              },
              "measurableVideos": {
                "type": "number",
                "description": "Uploads a probe can read, usually fewer."
              }
            },
            "required": [
              "channelId",
              "name",
              "videos"
            ]
          }
        }
      },
      "required": [
        "channels"
      ],
      "description": "One row per channel, largest catalogue first."
    }
  },
  {
    "name": "channel_action_list",
    "canonicalName": "actions",
    "category": "channels",
    "path": "actions",
    "description": "The prioritised moves for one channel, ordered by how many viewers each could recover, with the confidence behind each one and what would make it wrong. Computed from that channel's own figures, not from generic advice. `basis` is the number of uploads the advice actually rests on, and `checked` lists the dimensions that were measured and came back healthy — a list showing one action with no `checked` rows would read as an incomplete audit.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "channelId": {
          "type": "string",
          "description": "A YouTube channel id. Required."
        }
      },
      "required": [
        "channelId"
      ],
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "channelId": {
          "type": "string"
        },
        "channel": {
          "type": "string",
          "description": "Its name."
        },
        "niche": {
          "type": [
            "string",
            "null"
          ],
          "description": "Its confirmed marketplace, which routed the claims. Null when no person has confirmed one."
        },
        "basis": {
          "type": "number",
          "description": "How many uploads the advice rests on: the list's own figure, which is the recent cohort when retention exists and the catalogue otherwise. `notes` says which."
        },
        "catalogueVideos": {
          "type": "number",
          "description": "Uploads in the whole catalogue. Usually larger than `basis`, and the advice is not about all of them."
        },
        "videosWithWrittenAnalysis": {
          "type": "number",
          "description": "Uploads anywhere in the catalogue carrying a written per-moment analysis."
        },
        "actions": {
          "type": "array",
          "description": "The moves, ordered by viewers recoverable. An empty list is a real answer: it means nothing measured on this channel is worth acting on.",
          "items": {
            "type": "object",
            "properties": {
              "kind": {
                "type": "string",
                "description": "Which dimension it moves: intro, outro, mid-video, format-stop, format-double-down, length, cadence, packaging."
              },
              "do": {
                "type": "string",
                "description": "The move, as an instruction."
              },
              "because": {
                "type": "string",
                "description": "The arithmetic behind it, in one line."
              },
              "viewersAtStake": {
                "type": "number",
                "description": "Estimated viewers recoverable. What the list is ordered by."
              },
              "confidence": {
                "type": "string",
                "description": "measured-law, measured, channel-only, theory or refuted. `channel-only` means this channel's own arithmetic computed it and no cross-channel measurement backs the general principle; `refuted` means the ledger measured it and it failed, which is not the same as untested."
              },
              "claimId": {
                "type": "string",
                "description": "The claim behind it, when one is cited. Pass it to the claim-evidence tool."
              },
              "caveat": {
                "type": "string",
                "description": "What would make this wrong, when the evidence base has something to say about it."
              }
            },
            "required": [
              "kind",
              "do",
              "because",
              "viewersAtStake",
              "confidence"
            ]
          }
        },
        "checked": {
          "type": "array",
          "description": "Dimensions that WERE measured and came back healthy. A page showing one action is indistinguishable from a page where only one thing was checked.",
          "items": {
            "type": "object",
            "properties": {
              "kind": {
                "type": "string"
              },
              "finding": {
                "type": "string",
                "description": "What was measured, with the figure."
              }
            }
          }
        },
        "notes": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "What the list rests on and what it could not examine. A list with no retention data says in these words that nothing in it is about what happens inside a video."
        }
      },
      "required": [
        "channelId",
        "channel",
        "basis",
        "catalogueVideos",
        "videosWithWrittenAnalysis",
        "actions",
        "checked",
        "notes"
      ],
      "description": "The channel, what the advice rests on, the ordered actions, and the dimensions that came back clean."
    }
  },
  {
    "name": "channel_brief",
    "canonicalName": "channelBrief",
    "category": "channels",
    "path": "channelBrief",
    "description": "Everything the actions tool returns, with the evidence behind each action attached to it: the claim's standing, how consistently it held and across how many independent units, the probe that tested it, and an explicit list of what it does NOT establish. Prefer this over the actions tool whenever you intend to read the advice rather than merely count it — the alternative is one call per distinct claim, and the action list is the surface in this system with the least hedging on it, so an action read without its limits is exactly where a figure arrives without what it rests on. What is attached is the claim's brief and not its per-unit readings or its niche split; `evidenceNotes` says so and names the tool that returns those.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "channelId": {
          "type": "string",
          "description": "A YouTube channel id. Required."
        }
      },
      "required": [
        "channelId"
      ],
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "channelId": {
          "type": "string"
        },
        "channel": {
          "type": "string",
          "description": "Its name."
        },
        "niche": {
          "type": [
            "string",
            "null"
          ],
          "description": "Its confirmed marketplace, which routed the claims. Null when no person has confirmed one."
        },
        "basis": {
          "type": "number",
          "description": "How many uploads the advice rests on: the list's own figure, which is the recent cohort when retention exists and the catalogue otherwise. `notes` says which."
        },
        "catalogueVideos": {
          "type": "number",
          "description": "Uploads in the whole catalogue. Usually larger than `basis`, and the advice is not about all of them."
        },
        "videosWithWrittenAnalysis": {
          "type": "number",
          "description": "Uploads anywhere in the catalogue carrying a written per-moment analysis."
        },
        "actions": {
          "type": "array",
          "description": "The moves, ordered by viewers recoverable, each carrying the claim behind it when one is cited.",
          "items": {
            "type": "object",
            "properties": {
              "kind": {
                "type": "string",
                "description": "Which dimension it moves: intro, outro, mid-video, format-stop, format-double-down, length, cadence, packaging."
              },
              "do": {
                "type": "string",
                "description": "The move, as an instruction."
              },
              "because": {
                "type": "string",
                "description": "The arithmetic behind it, in one line."
              },
              "viewersAtStake": {
                "type": "number",
                "description": "Estimated viewers recoverable. What the list is ordered by."
              },
              "confidence": {
                "type": "string",
                "description": "measured-law, measured, channel-only, theory or refuted. `channel-only` means this channel's own arithmetic computed it and no cross-channel measurement backs the general principle; `refuted` means the ledger measured it and it failed, which is not the same as untested."
              },
              "claimId": {
                "type": "string",
                "description": "The claim behind it, when one is cited. Pass it to the claim-evidence tool."
              },
              "caveat": {
                "type": "string",
                "description": "What would make this wrong, when the evidence base has something to say about it."
              },
              "evidence": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "description": "Pass it to the claim-evidence tool."
                  },
                  "claim": {
                    "type": "string"
                  },
                  "standing": {
                    "type": "string",
                    "description": "Its rung on the evidence ladder: theory, candidate-law, law, warning, rejected. It moves DOWN as well as up."
                  },
                  "category": {
                    "type": "string"
                  },
                  "scope": {
                    "type": "string",
                    "description": "general or niched."
                  },
                  "niche": {
                    "type": "string",
                    "description": "The marketplace it is scoped to, when it is niched."
                  },
                  "signed": {
                    "type": "boolean",
                    "description": "A person put their name to it. A signature is not a measurement."
                  },
                  "measured": {
                    "type": "boolean",
                    "description": "At least one reading exists and the grade is not untested."
                  },
                  "contested": {
                    "type": "object",
                    "description": "Present when the claim is in a live dispute. Do not state it as settled.",
                    "properties": {
                      "nature": {
                        "type": "string"
                      },
                      "discriminatingQuestion": {
                        "type": "string",
                        "description": "The question that would settle it."
                      }
                    }
                  },
                  "evidence": {
                    "type": "object",
                    "description": "Present only when the claim has been measured. Absent means nobody has quantified it, which is not the same as it being false.",
                    "properties": {
                      "heldPct": {
                        "type": "number",
                        "description": "Share of readings where the claim's own predicted direction held."
                      },
                      "observations": {
                        "type": "number"
                      },
                      "units": {
                        "type": "number",
                        "description": "How many INDEPENDENT things those readings rest on."
                      },
                      "unitNoun": {
                        "type": "string",
                        "description": "What kind of thing a unit is — channels, niches. Never assumed: three readings from one crawl are not three channels."
                      },
                      "grade": {
                        "type": "string",
                        "description": "How much the evidence supports ACTING: untested, weak, moderate, strong."
                      },
                      "causalRung": {
                        "type": "string",
                        "description": "What kind of claim the evidence can support: none, correlation, consistent, dose-response, temporal, intervention. Earned by the DESIGN of the test, never read off the effect size."
                      },
                      "statistic": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "description": "The statistic the figure is in. Effects are never averaged across statistics."
                      },
                      "medianEffect": {
                        "type": "number",
                        "description": "In the statistic named above."
                      }
                    }
                  },
                  "secondBasis": {
                    "type": "object",
                    "description": "The other views basis (launch window vs lifetime accrual), when it has anything to say. Never pooled with the first.",
                    "properties": {
                      "reading": {
                        "type": "string"
                      },
                      "note": {
                        "type": "string"
                      }
                    }
                  },
                  "probe": {
                    "type": "object",
                    "description": "The probe the claim is bound to. Absent when nothing measures it.",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "question": {
                        "type": "string",
                        "description": "Worded on the probe's own axis, which is not always the direction the claim asserts."
                      },
                      "statistic": {
                        "type": "string"
                      },
                      "minN": {
                        "type": "number",
                        "description": "Below this many videos it returns nothing at all, because silence is the honest answer."
                      }
                    }
                  },
                  "limits": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "What this claim does NOT establish. Read it before acting on the action above."
                  }
                },
                "required": [
                  "id",
                  "claim",
                  "standing",
                  "category",
                  "scope",
                  "signed",
                  "measured",
                  "limits"
                ]
              }
            },
            "required": [
              "kind",
              "do",
              "because",
              "viewersAtStake",
              "confidence"
            ]
          }
        },
        "checked": {
          "type": "array",
          "description": "Dimensions that WERE measured and came back healthy. A page showing one action is indistinguishable from a page where only one thing was checked.",
          "items": {
            "type": "object",
            "properties": {
              "kind": {
                "type": "string"
              },
              "finding": {
                "type": "string",
                "description": "What was measured, with the figure."
              }
            }
          }
        },
        "notes": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "What the list rests on and what it could not examine. A list with no retention data says in these words that nothing in it is about what happens inside a video."
        },
        "evidenceNotes": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "How many actions cite a claim, how many rest on this channel's own arithmetic alone, what the attached records carry and what they leave to the claim tool. A cited id the store does not hold is named here rather than dropped."
        }
      },
      "required": [
        "channelId",
        "channel",
        "basis",
        "catalogueVideos",
        "videosWithWrittenAnalysis",
        "actions",
        "checked",
        "notes",
        "evidenceNotes"
      ],
      "description": "The action list, each action carrying the claim it cites, plus a note on what the attached evidence covers."
    }
  },
  {
    "name": "list_workflows",
    "canonicalName": "workflows",
    "category": "workflows",
    "path": "workflows",
    "description": "The ways this system is operated: channel audit, retention notes, video suggestion, packaging concept, autoresearch and more. Each names what it looks at, what it produces, what it never does, and the ONLY modes it may apply a claim in. Read this before asking for claims, so you use them the way the matching workflow would.",
    "inputSchema": {
      "type": "object",
      "properties": {},
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "workflows": {
          "type": "array",
          "description": "The register, one row per workflow, including any that are declared and not yet implemented.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Pass this to the workflow tool."
              },
              "name": {
                "type": "string"
              },
              "department": {
                "type": "string",
                "description": "Which deliverable it belongs to."
              },
              "question": {
                "type": "string",
                "description": "The one question it answers."
              },
              "looksAt": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "What it reads."
              },
              "applies": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "The application modes it is permitted: rule, prior, hypothesis, prohibition, do-not-repeat. Anything else is filtered out."
              },
              "produces": {
                "type": "string"
              },
              "writesBack": {
                "type": "string",
                "description": "What it records so the next workflow starts further along."
              },
              "neverDoes": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Prohibitions on the workflow itself, not on the advice."
              },
              "entry": {
                "type": "string",
                "description": "Where it is started from: a route, an npm script, a page or a file."
              },
              "status": {
                "type": "string",
                "description": "`planned` when it is not implemented yet — a stated gap, never a claim."
              }
            },
            "required": [
              "id",
              "name",
              "question",
              "applies",
              "produces"
            ]
          }
        }
      },
      "required": [
        "workflows"
      ],
      "description": "The register, one row per workflow."
    }
  },
  {
    "name": "workflow_intelligence",
    "canonicalName": "workflow",
    "category": "workflows",
    "path": "workflow",
    "description": "The claims one workflow may apply, bucketed by the mode it is allowed to apply them in: rules (laws, enforce them), priors (measured candidates, weight them, evidence attached), hypotheses (theories, test them, never assert them), prohibitions (warnings, do not recommend), do-not-repeat (refuted, do not re-derive). A theory can never arrive as a rule. Note the two terminal states are different lists and must not be merged: `prohibitions` here is where WARNINGS land, while refuted claims are `doNotRepeat`. `limit` caps how many claims come back per bucket (default 40). Whatever a cap left out is named in `omitted`.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "A workflow id from the workflows tool, e.g. video-suggestion. Required."
        },
        "niche": {
          "type": "string",
          "description": "The channel's marketplace, so the claims are routed the way the workflow would route them. Open: the legal set is the niches the store carries, which the vocabulary tool lists. An unknown one is not refused; it simply matches no niched claim. To route by a CHANNEL's own confirmed marketplace rather than one you chose, use the workflow-context tool instead of this parameter."
        },
        "limit": {
          "type": "number",
          "description": "How many claims come back in each bucket. Default 40.",
          "default": 40,
          "minimum": 1
        }
      },
      "required": [
        "id"
      ],
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "workflow": {
          "type": "string"
        },
        "niche": {
          "type": "string",
          "description": "The marketplace the claims were routed for, when one was supplied."
        },
        "rules": {
          "type": "array",
          "description": "Laws. Enforce them.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder, which decided the bucket it is in."
              },
              "mode": {
                "type": "string",
                "description": "How this workflow may apply it: rule, prior, hypothesis, prohibition, do-not-repeat."
              },
              "evidence": {
                "type": "object",
                "description": "Present only when measured. A prior without this is not a prior, and is omitted rather than sent.",
                "properties": {
                  "heldPct": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things it rests on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is. Three readings from one crawl are not three channels."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support."
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "mode"
            ]
          }
        },
        "priors": {
          "type": "array",
          "description": "Measured candidates. Weight them; the evidence is attached, and a prior with no evidence is omitted rather than sent.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder, which decided the bucket it is in."
              },
              "mode": {
                "type": "string",
                "description": "How this workflow may apply it: rule, prior, hypothesis, prohibition, do-not-repeat."
              },
              "evidence": {
                "type": "object",
                "description": "Present only when measured. A prior without this is not a prior, and is omitted rather than sent.",
                "properties": {
                  "heldPct": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things it rests on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is. Three readings from one crawl are not three channels."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support."
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "mode"
            ]
          }
        },
        "hypotheses": {
          "type": "array",
          "description": "Theories. Something to TEST, labelled untested in prose. Never assert one.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder, which decided the bucket it is in."
              },
              "mode": {
                "type": "string",
                "description": "How this workflow may apply it: rule, prior, hypothesis, prohibition, do-not-repeat."
              },
              "evidence": {
                "type": "object",
                "description": "Present only when measured. A prior without this is not a prior, and is omitted rather than sent.",
                "properties": {
                  "heldPct": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things it rests on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is. Three readings from one crawl are not three channels."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support."
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "mode"
            ]
          }
        },
        "prohibitions": {
          "type": "array",
          "description": "Warnings: moves this workflow must not recommend.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder, which decided the bucket it is in."
              },
              "mode": {
                "type": "string",
                "description": "How this workflow may apply it: rule, prior, hypothesis, prohibition, do-not-repeat."
              },
              "evidence": {
                "type": "object",
                "description": "Present only when measured. A prior without this is not a prior, and is omitted rather than sent.",
                "properties": {
                  "heldPct": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things it rests on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is. Three readings from one crawl are not three channels."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support."
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "mode"
            ]
          }
        },
        "doNotRepeat": {
          "type": "array",
          "description": "Claims the data refuted, listed so they are not re-derived.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "claim": {
                "type": "string"
              },
              "standing": {
                "type": "string",
                "description": "Its rung on the evidence ladder, which decided the bucket it is in."
              },
              "mode": {
                "type": "string",
                "description": "How this workflow may apply it: rule, prior, hypothesis, prohibition, do-not-repeat."
              },
              "evidence": {
                "type": "object",
                "description": "Present only when measured. A prior without this is not a prior, and is omitted rather than sent.",
                "properties": {
                  "heldPct": {
                    "type": "number"
                  },
                  "units": {
                    "type": "number",
                    "description": "How many INDEPENDENT things it rests on."
                  },
                  "unitNoun": {
                    "type": "string",
                    "description": "What kind of thing a unit is. Three readings from one crawl are not three channels."
                  },
                  "causalRung": {
                    "type": "string",
                    "description": "What kind of claim the evidence can support."
                  }
                }
              }
            },
            "required": [
              "id",
              "claim",
              "standing",
              "mode"
            ]
          }
        },
        "omitted": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Everything removed and why, narrowings first and caps last: the workflow's categories, its topic, the same two over the refuted claims, then any cap. The category narrowing is the large one and the workflow decides it — measured on the store on 2026-09-11 it removes between 140 and 719 of the 994 live claims, except for the one workflow that declares no categories and therefore narrows by nothing. Read this list rather than assuming a bucket is the whole store."
        },
        "withheld": {
          "type": "object",
          "description": "On-topic claims this workflow was NOT permitted to apply, counted by standing. A concept resting on zero laws should say that theories exist and none was allowed to constrain it.",
          "additionalProperties": {
            "type": "number"
          }
        }
      },
      "required": [
        "workflow",
        "rules",
        "priors",
        "hypotheses",
        "prohibitions",
        "doNotRepeat",
        "omitted",
        "withheld"
      ],
      "description": "Five buckets by application mode, what was left out, and what standing withheld."
    }
  },
  {
    "name": "workflow_context",
    "canonicalName": "workflowContext",
    "category": "channels",
    "path": "workflowContext",
    "description": "The claims one workflow may apply to one channel, routed by that channel's CONFIRMED marketplace rather than by a niche you choose. It carries the channel's row, the workflow's registry entry, the claims bucketed by the mode they are permitted in, and the mode contract itself as data. Prefer this over calling the workflow tool with a niche of your own: picking the niche is a routing decision, and getting it wrong returns a well-formed answer about a marketplace the channel is not in. There is no niche parameter for that reason. A channel with no confirmed marketplace is routed to the general store and the answer says so. `limit` caps how many claims come back per bucket (default 40). Whatever a cap left out is named in `workflow.omitted`.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "channelId": {
          "type": "string",
          "description": "A YouTube channel id. Required."
        },
        "workflowId": {
          "type": "string",
          "description": "A workflow id from the workflows tool, e.g. video-suggestion. Required."
        },
        "limit": {
          "type": "number",
          "description": "How many claims come back in each bucket. Default 40.",
          "default": 40,
          "minimum": 1
        }
      },
      "required": [
        "channelId",
        "workflowId"
      ],
      "additionalProperties": false
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "channel": {
          "type": "object",
          "properties": {
            "channelId": {
              "type": "string"
            },
            "name": {
              "type": "string",
              "description": "Its name, or the id when nothing has measured it yet."
            },
            "niche": {
              "type": [
                "string",
                "null"
              ],
              "description": "The marketplace, only when a HUMAN confirmed it. A proposal tags nothing and reads as null."
            },
            "scaleBand": {
              "type": [
                "string",
                "null"
              ]
            },
            "videos": {
              "type": "number",
              "description": "Uploads in the catalogue."
            },
            "measurableVideos": {
              "type": "number",
              "description": "Uploads a probe can read, usually fewer."
            }
          },
          "required": [
            "channelId",
            "name",
            "videos"
          ],
          "description": "Exactly what one row of the channels tool returns."
        },
        "routing": {
          "type": "string",
          "description": "Which marketplace routed this answer, whether any claim is actually scoped to it, and whether a person confirmed it."
        },
        "registry": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "Pass this to the workflow tool."
            },
            "name": {
              "type": "string"
            },
            "department": {
              "type": "string",
              "description": "Which deliverable it belongs to."
            },
            "question": {
              "type": "string",
              "description": "The one question it answers."
            },
            "looksAt": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "What it reads."
            },
            "applies": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "The application modes it is permitted: rule, prior, hypothesis, prohibition, do-not-repeat. Anything else is filtered out."
            },
            "produces": {
              "type": "string"
            },
            "writesBack": {
              "type": "string",
              "description": "What it records so the next workflow starts further along."
            },
            "neverDoes": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Prohibitions on the workflow itself, not on the advice."
            },
            "entry": {
              "type": "string",
              "description": "Where it is started from: a route, an npm script, a page or a file."
            },
            "status": {
              "type": "string",
              "description": "`planned` when it is not implemented yet — a stated gap, never a claim."
            }
          },
          "required": [
            "id",
            "name",
            "question",
            "applies",
            "produces"
          ],
          "description": "Exactly what one row of the workflows tool returns."
        },
        "workflow": {
          "type": "object",
          "description": "Exactly what the workflow tool returns; that tool's output schema names every bucket.",
          "properties": {
            "omitted": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Everything removed and why, narrowings first and caps last: the workflow's categories, its topic, the same two over the refuted claims, then any cap. The category narrowing is the large one and the workflow decides it — measured on the store on 2026-09-11 it removes between 140 and 719 of the 994 live claims, except for the one workflow that declares no categories and therefore narrows by nothing. Read this list rather than assuming a bucket is the whole store."
            },
            "withheld": {
              "type": "object",
              "description": "On-topic claims this workflow was NOT permitted to apply, counted by standing.",
              "additionalProperties": {
                "type": "number"
              }
            }
          }
        },
        "modes": {
          "type": "object",
          "description": "The ONLY application modes each standing may reach a workflow in. Travels with the answer so no consumer has to copy it: the copy that exists downstream is pinned to a revision hash in a fail-closed validator, and the day this table moves that validator starts rejecting correct answers as drift.",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "required": [
        "channel",
        "routing",
        "registry",
        "workflow",
        "modes"
      ],
      "description": "The channel row, how it was routed, the registry entry, the bucketed claims, and the mode contract."
    }
  }
];
// ── END GENERATED TOOL TABLE ───────────────────────────────────────────────

// Both spellings resolve: the published MCP name and the canonical short name
// the HTTP path and the documents use. An alias that does not resolve is not an
// alias, and a caller holding either one is holding a real contract.
const byName = new Map();
for (const t of TOOLS) {
  byName.set(t.name, t);
  if (t.canonicalName && t.canonicalName !== t.name) byName.set(t.canonicalName, t);
}

async function callTool(name, args) {
  const tool = byName.get(name);
  if (!tool) {
    throw new Error(`no such tool: ${name}. This server has ${TOOLS.map((t) => t.name).join(", ")}.`);
  }
  if (!BASE || !KEY) {
    throw new Error(
      "YT_INTELLIGENCE_URL and YT_INTELLIGENCE_KEY must both be set. Ask whoever gave you this file for a key; it is read-only.",
    );
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(args || {})) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const url = `${BASE}/${tool.path}${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${KEY}` } });
  const body = await res.text();
  if (!res.ok) {
    // The API's own error text explains the fix (a missing key, a 503 because
    // the deployment has the API switched off, a parameter it refused and the
    // legal values for it). Passing it through beats replacing it with a
    // status code.
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 900)}`);
  }
  return body;
}

/**
 * A tool that declares an `outputSchema` must answer with `structuredContent`,
 * or a client validating the contract sees the tool break its own promise. The
 * text block stays alongside it: clients that predate structured output read
 * that one, and it is the only thing a human sees in a transcript.
 */
function resultFor(body) {
  const content = [{ type: "text", text: body }];
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { content };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { content };
  return { content, structuredContent: parsed };
}

// ── JSON-RPC over newline-delimited stdio ──────────────────────────────────

const send = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) => send({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg) {
  const { id, method, params } = msg;
  // A notification has no id and must never be answered.
  const isRequest = id !== undefined && id !== null;

  switch (method) {
    case "initialize":
      return reply(id, {
        protocolVersion: params?.protocolVersion || DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: NAME, version: VERSION },
      });
    case "notifications/initialized":
    case "initialized":
      return;
    case "ping":
      return isRequest && reply(id, {});
    case "tools/list":
      return reply(id, {
        tools: TOOLS.map(({ name, description, inputSchema, outputSchema }) => ({ name, description, inputSchema, outputSchema })),
      });
    case "tools/call":
      try {
        const out = await callTool(params?.name, params?.arguments);
        return reply(id, resultFor(out));
      } catch (err) {
        // An MCP tool error is reported INSIDE the result with isError, not as
        // a JSON-RPC error: the model should see what went wrong and adapt,
        // rather than the client treating it as a broken server.
        return reply(id, { content: [{ type: "text", text: String(err?.message || err) }], isError: true });
      }
    default:
      if (isRequest) fail(id, -32601, `method not found: ${method}`);
  }
}

let buf = "";
/**
 * Requests still in flight, and why they are counted.
 *
 * Every answer here waits on a `fetch`, and `process.exit(0)` on end-of-stdin
 * killed the process before those promises settled: a client that writes its
 * requests and closes the pipe got the synchronous replies and silently lost
 * every asynchronous one. It does not bite an interactive client, which holds
 * stdin open for the session, and it loses answers for anything scripted. So
 * end-of-stdin means "no more requests", not "stop working" — with a ceiling,
 * because a hung connector is a worse failure than a dropped answer.
 */
let inFlight = 0;
let stdinEnded = false;
const exitWhenIdle = () => {
  if (!stdinEnded || inFlight !== 0) return;
  // Stop holding the loop open and let the process END, rather than calling
  // process.exit here. Exiting while a socket from the last fetch is still
  // closing aborts on Windows with a libuv assertion
  // (`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`), and moving the
  // call one turn later only narrowed the window — it came back on the next
  // run. Node's own keep-alive pool closes its socket within a few seconds and
  // the process then exits by itself with nothing left to do.
  process.stdin.pause();
  process.exitCode = 0;
  // A long stop, in case something really is stuck. `unref`ed, so it is never
  // itself the reason the process is alive, and far enough out that nothing is
  // mid-close when it fires.
  setTimeout(() => process.exit(0), 15_000).unref();
};
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // A malformed line is not worth killing the session over.
    }
    inFlight += 1;
    Promise.resolve(handle(msg))
      .catch((err) => {
        if (msg?.id !== undefined && msg?.id !== null) fail(msg.id, -32603, String(err?.message || err));
      })
      .finally(() => {
        inFlight -= 1;
        exitWhenIdle();
      });
  }
});
process.stdin.on("end", () => {
  stdinEnded = true;
  exitWhenIdle();
  setTimeout(() => process.exit(0), 60_000).unref();
});
