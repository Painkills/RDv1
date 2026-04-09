import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  User, 
  Car, 
  Heart, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Clock,
  HelpCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  Tag, 
  Card, 
  PlayerState, 
  CustomerState, 
  ProductOnBoard, 
  GamePhase
} from './types';
import { 
  CUSTOMER_ARCHETYPES, 
  STARTER_DECK
} from './constants';


// --- Components ---

const StatItem = ({ icon: Icon, label, value, max, color, prefix }: { icon: any, label: string, value: number, max?: number, color: string, prefix?: string }) => (
  <div className="flex flex-col items-center px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={cn("w-4 h-4", color)} />
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</span>
    </div>
    <div className="text-xl font-mono font-bold">
      {prefix}{value.toLocaleString()}{max !== undefined && <span className="text-zinc-600 text-sm">/{max.toLocaleString()}</span>}
    </div>
  </div>
);

const TagBadge = ({ tag, revealed }: { tag: Tag, revealed?: boolean }) => {
  const colors: Record<Tag, string> = {
    safety: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    economy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    comfort: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    performance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    technology: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className={cn(
      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all duration-300",
      revealed ? colors[tag] : "bg-zinc-800 text-zinc-500 border-zinc-700"
    )}>
      {revealed ? tag : '???'}
    </div>
  );
};

const PileView = ({ title, cards, icon: Icon, position }: { title: string, cards: Card[], icon: any, position: 'left' | 'right' }) => (
  <div className={cn(
    "absolute bottom-4 flex flex-col items-center group z-50",
    position === 'left' ? "left-8" : "right-8"
  )}>
    <div className="relative">
      <div className={cn(
        "w-12 h-16 rounded-lg border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-xl transition-all group-hover:border-zinc-600 group-hover:-translate-y-1",
        cards.length === 0 && "opacity-50"
      )}>
        <Icon className="w-6 h-6 text-zinc-600" />
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black">
          {cards.length}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className={cn(
        "absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0",
        position === 'left' ? "left-0" : "right-0"
      )}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl min-w-[200px] max-h-[300px] overflow-y-auto">
          <h4 className="text-[10px] uppercase font-black text-zinc-500 mb-3 border-b border-zinc-800 pb-2 flex justify-between">
            <span>{title}</span>
            <span>{cards.length} Cards</span>
          </h4>
          <div className="space-y-1.5">
            {cards.length === 0 ? (
              <div className="text-[10px] text-zinc-700 italic">Empty</div>
            ) : (
              cards.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-zinc-300 truncate">{c.name}</span>
                  <span className="text-[8px] uppercase font-black text-zinc-600">{c.type}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    <span className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-600">{title}</span>
  </div>
);

const GameCard = ({ card, onClick, disabled, selected }: { card: Card, onClick?: () => void, disabled?: boolean, selected?: boolean }) => {
  const typeColors: Record<string, string> = {
    product: 'border-blue-500/50 bg-blue-500/5',
    value: 'border-emerald-500/50 bg-emerald-500/5',
    rapport: 'border-purple-500/50 bg-purple-500/5',
    reveal: 'border-orange-500/50 bg-orange-500/5',
    discovery: 'border-yellow-500/50 bg-yellow-500/5',
  };

  return (
    <motion.div
      whileHover={!disabled ? { y: -10, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "relative w-40 h-56 rounded-xl border-2 p-3 flex flex-col cursor-pointer transition-all duration-300",
        typeColors[card.type],
        disabled && "opacity-50 grayscale cursor-not-allowed",
        selected && "ring-4 ring-white ring-offset-4 ring-offset-zinc-950 scale-105 z-10"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">{card.type}</span>
        <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-yellow-500">
          {card.energyCost}
        </div>
      </div>
      
      <h3 className="text-sm font-bold leading-tight mb-1">{card.name}</h3>
      <p className="text-[10px] text-zinc-400 mb-auto">{card.description}</p>
      
      <div className="mt-2 space-y-1">
        {card.value && (
          <div className="text-xs font-mono font-bold text-emerald-400">
            +${card.value.toLocaleString()}
          </div>
        )}
        {card.tags && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map(t => <TagBadge key={t} tag={t} revealed />)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('floor');
  const [player, setPlayer] = useState<PlayerState>({
    reputation: 2000,
    maxReputation: 2000,
    rapport: 0,
    energy: 4,
    maxEnergy: 4,
    deck: [...STARTER_DECK],
    hand: [],
    discard: [],
    exhausted: [],
    profit: 0,
    currentNegotiationProfit: 0,
    quarterlyTarget: 50000,
    negotiatedCustomers: [],
  });

  const [customer, setCustomer] = useState<CustomerState | null>(null);
  const [board, setBoard] = useState<ProductOnBoard[]>([]);
  const [turn, setTurn] = useState(1);
  const [logs, setLogs] = useState<string[]>(["Welcome to the dealership floor."]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [isCustomerTurn, setIsCustomerTurn] = useState(false);
  const [feedback, setFeedback] = useState<{ player?: boolean, customer?: boolean }>({});

  const generateNextAction = useCallback((archetype: string) => {
    const weights: Record<string, number> = {
      "Objection": 3,
      "Stall": 1,
      "Silence": 1,
      "Excuse": 1
    };
    
    // Skeptic fires objections more often
    if (archetype === 'Skeptic') {
      weights["Objection"] = 6;
    }

    const pool: string[] = [];
    Object.entries(weights).forEach(([action, weight]) => {
      for(let i=0; i<weight; i++) pool.push(action);
    });

    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  // --- Game Logic ---

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const drawCards = useCallback((count: number) => {
    setPlayer(prev => {
      let newDeck = [...prev.deck];
      let newDiscard = [...prev.discard];
      const newHand = [...prev.hand];


      for (let i = 0; i < count; i++) {
        if (newDeck.length === 0) {
          if (newDiscard.length === 0) break;
          newDeck = [...newDiscard].sort(() => Math.random() - 0.5);
          newDiscard = [];
        }
        newHand.push(newDeck.pop()!);
      }

      return { ...prev, deck: newDeck, discard: newDiscard, hand: newHand };
    });
  }, []);

  const startNegotiation = (archetypeName: string) => {
    const archetype = CUSTOMER_ARCHETYPES[archetypeName];
    const budget = Math.floor(Math.random() * (archetype.baseBudget[1] - archetype.baseBudget[0]) + archetype.baseBudget[0]);
    const strength = Math.floor(Math.random() * (archetype.objectionStrength[1] - archetype.objectionStrength[0]) + archetype.objectionStrength[0]);
    
    const newCustomer: CustomerState = {
      name: `The ${archetypeName}`,
      archetype: archetypeName,
      budget: budget,
      maxBudget: budget,
      priorities: archetype.priorities.map(tag => ({ tag, revealed: false })),
      missedTags: [],
      objectionType: archetype.objectionType,
      objectionStrength: strength,
      nextAction: generateNextAction(archetypeName),
    };

    setCustomer(newCustomer);
    setPhase('negotiation');
    setBoard([]);
    setTurn(1);
    setPlayer(prev => {
      const fullDeck = [...prev.deck, ...prev.discard];
      return {
        ...prev,
        energy: prev.maxEnergy,
        rapport: 0,
        currentNegotiationProfit: 0,
        hand: [],
        discard: [],
        deck: fullDeck.sort(() => Math.random() - 0.5),
        negotiatedCustomers: [...prev.negotiatedCustomers, archetypeName]
      };
    });
    drawCards(5);
    addLog(`Negotiation started with ${newCustomer.name}.`);
  };

  const endTurn = () => {
    setIsCustomerTurn(true);
    addLog("Customer is thinking...");
    
    setTimeout(() => {
      handleCustomerAction();
    }, 1000);
  };

  const handleCustomerAction = () => {
    if (!customer) return;

    let finalDamage = 0;
    let logMsg = "";

    // Determine effect based on action
    switch (customer.nextAction) {
      case 'Stall':
        logMsg = "The customer is considering other options. (Next offer value halved) ";
        setCustomer(prev => prev ? { ...prev, isStalled: true } : null);
        break;
      case 'Excuse':
        logMsg = "The customer makes an excuse. (Any offer this turn will miss!) ";
        setCustomer(prev => prev ? { ...prev, isExcused: true } : null);
        break;
      case 'Silence':
        logMsg = "The customer is silent... ";
        break;
      case 'Objection':
      default:
        finalDamage = customer.objectionStrength;
        if (customer.archetype === 'Skeptic') {
          logMsg = "The Skeptic questions everything. ";
        } else if (turn % 2 === 0 && customer.archetype === 'Young Family') {
          logMsg = "The Family is worried about the price. ";
        } else {
          logMsg = "The customer raises an objection. ";
        }
        break;
    }

    if (finalDamage > 0) {
      setFeedback(prev => ({ ...prev, player: true }));
      setTimeout(() => setFeedback(prev => ({ ...prev, player: false })), 500);
    }

    setPlayer(prev => {
      const rapportAbsorption = Math.min(finalDamage, prev.rapport);
      const overflowDamage = Math.max(0, finalDamage - prev.rapport);
      const newRep = Math.max(0, prev.reputation - overflowDamage);
      
      if (finalDamage > 0) {
        if (overflowDamage > 0) {
          addLog(`${logMsg} Objection of ${finalDamage} dealt: ${rapportAbsorption} blocked by rapport, ${overflowDamage} hit reputation!`);
        } else {
          addLog(`${logMsg} Objection of ${finalDamage} fully absorbed by rapport.`);
        }
      } else if (logMsg && customer.nextAction !== 'Silence') {
        addLog(logMsg);
      } else if (customer.nextAction === 'Silence') {
        addLog("Silence... nothing happens.");
      }

      return { ...prev, reputation: newRep, rapport: 0, energy: prev.maxEnergy };
    });

    setCustomer(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        nextAction: generateNextAction(prev.archetype),
        isExcused: false // Reset excuse at start of player turn
      };
    });

    setTurn(t => t + 1);
    setIsCustomerTurn(false);
    
    // Discard hand and draw new
    setPlayer(prev => {
      const newDiscard = [...prev.discard, ...prev.hand];
      return { ...prev, hand: [], discard: newDiscard };
    });
    drawCards(5);
  };

  const playCard = (idx: number) => {
    if (isCustomerTurn) return;
    const card = player.hand[idx];
    if (player.energy < card.energyCost) return;

    const isExhausted = card.type === 'discovery' && card.energyCost === 0;

    if (card.type === 'product') {
      if (board.length >= 3) {
        addLog("No more space on the shelf!");
        return;
      }
      setBoard(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        baseCard: card,
        slots: Array(card.slots || 0).fill(null),
        totalValue: card.value || 0,
        tags: []
      }]);
      addLog(`Placed ${card.name} on the shelf.`);
    } else if (card.type === 'rapport') {
      setPlayer(prev => ({ ...prev, rapport: prev.rapport + (card.value || 0) }));
      addLog(`Built ${card.value} rapport.`);
    } else if (card.type === 'value') {
      // Need to select a product to attach to
      setSelectedCardIdx(idx);
      addLog("Select a product to attach this to.");
      return;
    } else if (card.id.startsWith('action-')) {
      // Need to select a product to act on
      setSelectedCardIdx(idx);
      addLog(`Select a product to ${card.name.toLowerCase()}.`);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      energy: prev.energy - card.energyCost,
      hand: prev.hand.filter((_, i) => i !== idx),
      // Products stay on board, don't discard yet
      discard: (isExhausted || card.type === 'product') ? prev.discard : [...prev.discard, card],
      exhausted: isExhausted ? [...prev.exhausted, card] : prev.exhausted,
    }));
  };

  const attachToProduct = (productIdx: number) => {
    if (selectedCardIdx === null) return;
    const card = player.hand[selectedCardIdx];
    const product = board[productIdx];

    if (card.type === 'value') {
      const emptySlotIdx = product.slots.findIndex(s => s === null);
      if (emptySlotIdx === -1) {
        addLog("Product slots are full! Played as generic $200 offer.");
        setPlayer(prev => ({
          ...prev,
          energy: prev.energy - card.energyCost,
          hand: prev.hand.filter((_, i) => i !== selectedCardIdx),
          discard: [...prev.discard, card]
        }));
      } else {
        setBoard(prev => {
          const newBoard = [...prev];
          const newSlots = [...newBoard[productIdx].slots];
          newSlots[emptySlotIdx] = card;
          newBoard[productIdx] = {
            ...newBoard[productIdx],
            slots: newSlots,
            totalValue: newBoard[productIdx].totalValue + (card.value || 0),
            tags: Array.from(new Set([...newBoard[productIdx].tags, ...(card.tags || [])]))
          };
          return newBoard;
        });
        addLog(`Attached ${card.name} to ${product.baseCard.name}.`);
        setPlayer(prev => ({
          ...prev,
          energy: prev.energy - card.energyCost,
          hand: prev.hand.filter((_, i) => i !== selectedCardIdx),
          discard: [...prev.discard, card]
        }));
      }
    } else if (card.id === 'action-offer-1') {
      offerProduct(productIdx);
      setPlayer(prev => ({
        ...prev,
        energy: prev.energy - card.energyCost,
        hand: prev.hand.filter((_, i) => i !== selectedCardIdx),
        discard: [...prev.discard, card]
      }));
    } else if (card.id === 'action-sacrifice-1') {
      handleUseAsShield(productIdx);
      setPlayer(prev => ({
        ...prev,
        energy: prev.energy - card.energyCost,
        hand: prev.hand.filter((_, i) => i !== selectedCardIdx),
        discard: [...prev.discard, card]
      }));
    }
    setSelectedCardIdx(null);
  };

  const handleUseAsShield = (productIdx: number) => {
    const product = board[productIdx];
    if (!product) return;

    const rapportGain = Math.floor(product.totalValue * 0.1);

    setPlayer(prev => ({
      ...prev,
      rapport: prev.rapport + rapportGain,
    }));
    
    setBoard(prev => prev.filter((_, i) => i !== productIdx));
    addLog(`Sacrificed ${product.baseCard.name} for ${rapportGain} rapport!`);
  };

  const offerProduct = (productIdx: number) => {
    if (!customer) return;
    const product = board[productIdx];
    const returnedCards = [product.baseCard, ...product.slots.filter((s): s is Card => s !== null)];
    
    const hits = product.tags.filter(tag => customer.priorities.some(p => p.tag === tag));
    let isHit = hits.length > 0;

    if (customer.isExcused) {
      addLog("Customer made an excuse! The offer automatically misses.");
      isHit = false;
    }

    if (isHit) {
      setFeedback(prev => ({ ...prev, customer: true }));
      setTimeout(() => setFeedback(prev => ({ ...prev, customer: false })), 500);

      let value = product.totalValue;
      if (customer.isStalled) {
        value = Math.floor(value / 2);
        addLog("Stall active: Offer value halved!");
      }

      setCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          budget: Math.max(0, prev.budget - value),
          priorities: prev.priorities.map(p => hits.includes(p.tag) ? { ...p, revealed: true } : p),
          isStalled: false // Stall consumed
        };
      });

      addLog(`HIT! Offer accepted for $${value.toLocaleString()}.`);
      
      if (customer.budget - value <= 0) {
        // handleWin will clear the board and discard everything including this product
        handleWin(value); 
        return; // Exit early, board will be cleared by handleWin
      } else {
        setPlayer(prev => ({ 
          ...prev, 
          profit: prev.profit + value, 
          currentNegotiationProfit: prev.currentNegotiationProfit + value,
          discard: [...prev.discard, ...returnedCards]
        }));
      }
    } else {
      setCustomer(prev => {
        if (!prev) return null;
        const newMissed = Array.from(new Set([...prev.missedTags, ...product.tags]));
        return { ...prev, missedTags: newMissed };
      });
      addLog(`MISS! Customer rejected the offer.`);
      setPlayer(prev => ({ 
        ...prev, 
        discard: [...prev.discard, ...returnedCards]
      }));
    }

    setBoard(prev => prev.filter((_, i) => i !== productIdx));
  };

  const handleWin = (finalValue: number) => {
    // Collect all cards from board
    setBoard(currentBoard => {
      const boardCards = currentBoard.flatMap(p => [p.baseCard, ...p.slots.filter((s): s is Card => s !== null)]);
      
      setPlayer(prev => ({ 
        ...prev, 
        profit: prev.profit + finalValue,
        currentNegotiationProfit: prev.currentNegotiationProfit + finalValue,
        hand: [],
        discard: [...prev.discard, ...prev.hand, ...boardCards]
      }));
      
      return [];
    });

    setPhase('results');
    addLog("Deal Closed!");
  };

  useEffect(() => {
    if (player.reputation <= 0 && phase === 'negotiation') {
      setPhase('gameover');
      addLog("Reputation destroyed. Dealership closed.");
    }
  }, [player.reputation, phase]);


  // --- Views ---

  if (phase === 'floor') {
    return (
      <div className="min-h-screen p-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Dealership Floor</h1>
            <p className="text-zinc-500 font-medium">Quarterly Target: ${player.profit.toLocaleString()} / ${player.quarterlyTarget.toLocaleString()}</p>
          </div>
          <div className="flex gap-4">
            <StatItem icon={Heart} label="Reputation" value={player.reputation} max={player.maxReputation} color="text-red-500" />
            <StatItem icon={TrendingUp} label="Profit" value={player.profit} color="text-emerald-500" prefix="$" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(CUSTOMER_ARCHETYPES).map(archetype => {
            const isNegotiated = player.negotiatedCustomers.includes(archetype.name);
            return (
              <motion.div
                key={archetype.name}
                whileHover={!isNegotiated ? { y: -5 } : {}}
                className={cn(
                  "bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col transition-opacity",
                  isNegotiated && "opacity-40 grayscale"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{archetype.name}</h3>
                    <p className="text-xs text-zinc-500">{archetype.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Objection</span>
                    <span className="font-mono uppercase">{archetype.objectionType}</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 italic mt-2">
                    "{archetype.behavior}"
                  </div>
                </div>

                <button
                  onClick={() => !isNegotiated && startNegotiation(archetype.name)}
                  disabled={isNegotiated}
                  className={cn(
                    "w-full py-3 font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2",
                    isNegotiated 
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-zinc-200"
                  )}
                >
                  {isNegotiated ? "Negotiated" : "Approach"} <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'negotiation' && customer) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 overflow-hidden">
        {/* Top Bar: Customer Info (Simplified) */}
        <div className="bg-zinc-900/80 backdrop-blur border-b border-zinc-800 p-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h2 className="font-black uppercase italic tracking-tight">{customer.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex gap-1">
                    {customer.priorities.map((p, i) => (
                      <TagBadge key={i} tag={p.tag} revealed={p.revealed} />
                    ))}
                  </div>
                  {customer.missedTags.length > 0 && (
                    <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                      <span className="text-[8px] font-black uppercase text-zinc-600">Missed:</span>
                      <div className="flex gap-1">
                        {customer.missedTags.map((t, i) => (
                          <div key={i} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-bold uppercase">
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <StatItem icon={TrendingUp} label="Negotiation Profit" value={player.currentNegotiationProfit} color="text-emerald-500" prefix="$" />
          </div>
        </div>

        {/* Main Board */}
        <div className="flex-grow relative flex items-center justify-between px-12 py-8">
          {/* Customer Representation (Left) */}
          <div className="flex flex-col items-center gap-6 w-64">
            {/* Intent Indicator (Always Visible) */}
            <div className="w-full">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-2xl flex flex-col items-center">
                <span className="text-[10px] uppercase font-black text-zinc-500 mb-2 tracking-widest">Customer Intent</span>
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-full border border-zinc-800">
                    {customer.nextAction === 'Objection' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {customer.nextAction === 'Stall' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {customer.nextAction === 'Silence' && <XCircle className="w-4 h-4 text-zinc-500" />}
                    {customer.nextAction === 'Excuse' && <HelpCircle className="w-4 h-4 text-orange-500" />}
                    <span className="text-xs font-black uppercase tracking-widest">
                      {customer.nextAction === 'Objection' ? 'Direct Objection' : customer.nextAction}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold text-center leading-relaxed px-2">
                    {customer.nextAction === 'Objection' && `Will deal ${customer.objectionStrength} reputation damage`}
                    {customer.nextAction === 'Stall' && "Will halve the value of your next offer (No reputation damage)"}
                    {customer.nextAction === 'Silence' && "Will take no action this turn (No reputation damage)"}
                    {customer.nextAction === 'Excuse' && "Will cause your next offer to miss (No reputation damage)"}
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              animate={feedback.customer ? { scale: [1, 1.1, 1], backgroundColor: ['#18181b', '#064e3b', '#18181b'] } : {}}
              className="relative w-40 h-40 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl"
            >
              <User className="w-24 h-24 text-zinc-800 translate-y-3" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
            </motion.div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-black text-zinc-500">
                <span>Budget</span>
                <span className="text-emerald-400 font-mono">${customer.budget.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(customer.budget / customer.maxBudget) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-zinc-400">{customer.archetype}</h3>
              <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-[0.2em]">{customer.objectionType} Objection Type</p>
            </div>
          </div>

          {/* Shelf (Middle) */}
          <div className="flex gap-4 items-end h-80 px-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="relative group">
                {board[i] ? (
                  <motion.div 
                    layoutId={board[i].id}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <div 
                        onClick={() => selectedCardIdx !== null && attachToProduct(i)}
                        className={cn(
                          "w-40 h-56 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col p-3 transition-all",
                          selectedCardIdx !== null && "border-white/50 bg-white/5 cursor-pointer animate-pulse"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Car className="w-4 h-4 text-blue-400" />
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Product</span>
                        </div>
                        <h4 className="text-xs font-bold mb-1 truncate">{board[i].baseCard.name}</h4>
                        <div className="text-[10px] font-mono text-emerald-400 mb-2">${board[i].totalValue.toLocaleString()}</div>
                        
                        <div className="flex-grow space-y-1">
                          {board[i].slots.map((slot, sIdx) => (
                            <div key={sIdx} className="h-8 rounded-lg border border-zinc-800 bg-zinc-950/50 flex items-center px-2 gap-2">
                              {slot ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[8px] font-medium truncate">{slot.name}</span>
                                </>
                              ) : (
                                <span className="text-[8px] text-zinc-700 uppercase font-bold tracking-widest">Empty</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {board[i].tags.map(t => <TagBadge key={t} tag={t} revealed />)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-40 h-56 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="w-5 h-5 text-zinc-800 mx-auto mb-2" />
                      <span className="text-[8px] text-zinc-800 uppercase font-black tracking-widest">Empty Shelf</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Player Representation (Right) */}
          <div className="flex flex-col items-center gap-4 w-64">
            <motion.div
              animate={feedback.player ? { x: [-10, 10, -10, 10, 0], backgroundColor: ['#18181b', '#450a0a', '#18181b'] } : {}}
              className="relative w-40 h-40 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl"
            >
              <User className="w-24 h-24 text-zinc-700 translate-y-3" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
            </motion.div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-black text-zinc-500">
                <span>Reputation</span>
                <span className={cn("font-mono", player.reputation < 500 ? "text-red-500" : "text-zinc-300")}>
                  {player.reputation}/{player.maxReputation}
                </span>
              </div>
              <div className="h-3 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(player.reputation / player.maxReputation) * 100}%` }}
                  className={cn("h-full transition-colors duration-500", player.reputation < 500 ? "bg-red-600" : "bg-red-500")}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <StatItem icon={Shield} label="Rapport" value={player.rapport} color="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Logs Overlay */}
        <div className="absolute top-24 left-4 w-64 space-y-2 pointer-events-none z-50">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div
                key={log + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-zinc-900/80 border border-zinc-800 p-2 rounded text-[10px] font-medium text-zinc-300"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Bar: Hand & Controls */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 p-6 relative">
          {/* Energy & End Turn */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-black italic">{player.energy}<span className="text-zinc-600 text-lg">/{player.maxEnergy}</span></span>
            </div>
            <button
              onClick={endTurn}
              disabled={isCustomerTurn}
              className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-2xl"
            >
              End Turn
            </button>
          </div>

          {/* Hand */}
          <div className="flex justify-center gap-4 max-w-4xl mx-auto pt-4 overflow-x-auto pb-2">
            {player.hand.map((card, i) => (
              <GameCard 
                key={`${card.id}-${i}`} 
                card={card} 
                onClick={() => selectedCardIdx === i ? setSelectedCardIdx(null) : playCard(i)}
                disabled={player.energy < card.energyCost || isCustomerTurn}
                selected={selectedCardIdx === i}
              />
            ))}
          </div>

          {/* Deck & Discard Piles */}
          <PileView title="Deck" cards={player.deck} icon={Clock} position="left" />
          <PileView title="Discard" cards={player.discard} icon={XCircle} position="right" />
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black uppercase italic mb-2">Deal Closed!</h2>
          <p className="text-zinc-500 mb-8">You successfully navigated the negotiation and secured a sale.</p>
          
          <div className="bg-zinc-950 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 uppercase text-xs font-bold">Negotiation Profit</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">+${player.currentNegotiationProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 uppercase text-xs font-bold">Reputation</span>
              <span className="text-lg font-mono font-bold text-zinc-300">{player.reputation}%</span>
            </div>
          </div>

          <button
            onClick={() => setPhase('floor')}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Back to Floor
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-red-950/20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase italic mb-2">Dealership Closed</h2>
          <p className="text-zinc-500 mb-8">Your reputation has hit zero. No more customers will trust your dealership.</p>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-colors"
          >
            Restart Career
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
