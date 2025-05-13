# EVM Sniper bot

Listens for newly created pairs/pools on any uniswap forked dex. Once a new pool/pair is created we determine if its a new token or two already known tokens. If its a new token we run it through an series of audits and if it isn't then we discard it. If the audit comes back succesful then we should buy the token and then sell it at a target price. If the the token is sold we should then pass the pair/pool to a list of tokens that need to be investegated for reinvestment/see if its a legit project.
