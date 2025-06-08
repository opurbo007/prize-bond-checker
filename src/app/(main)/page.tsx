"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusCircle, X } from "lucide-react";
import BondCard from "@/components/BondCard";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CardSkeletonGrid from "./Skeleton";

type Bond = {
  _id: string;
  number: string;
  purchaseDate: string;
  status: "hold" | "win" | "sell";
};

type Card = {
  _id: string;
  name: string;
  totalBond: number;
  totalWin: number;
  prizeBonds: Bond[];
};

export default function HomePage() {
  const [hasCards, setHasCards] = useState(false);
  const [cardName, setCardName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<
    {
      cardName: string;
      bond: Bond;
    }[]
  >([]);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/card");
      const json = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch cards", json.message);
        setCards([]);
        setHasCards(false);
        return;
      }

      setCards(json.data.cards);
      setHasCards(json.data.cards.length > 0);
    } catch (err) {
      console.error("Failed to fetch cards", err);
      toast.error("Failed to fetch cards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (close: () => void) => {
    if (!cardName.trim()) return toast("Please enter a card name.");
    setIsLoading(true);
    try {
      const res = await fetch("/api/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cardName }),
      });

      const json = await res.json();

      if (res.ok) {
        setCards((prev) => [...prev, json.data.card]);
        setHasCards(true);
        toast.success("Card created successfully!");
        setCardName("");
        close();
      } else {
        toast.error(json.message || "Failed to create card");
      }
    } catch (error) {
      console.error("Error creating card", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBond = async (cardId: string, bondNumber: string) => {
    try {
      const res = await fetch(`/api/card/${cardId}/bonds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: bondNumber }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Fail to add Bond");
        return;
      }

      const updatedCard = json.data.card;
      toast.success("Bond added successfully!");
      setCards((prev) =>
        prev.map((card) => (card._id === cardId ? updatedCard : card))
      );
    } catch (err) {
      console.error("Error adding bond:", err);
      toast.error("Failed to add bond. Please try again.");
    }
  };

  const onEditCard = async (cardId: string, newName: string) => {
    setIsLoading(true);
    const res = await fetch(`/api/card/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
      headers: { "Content-Type": "application/json" },
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Failed to parse response:", err);
      toast.error("Failed to edit card");
      return;
    } finally {
      setIsLoading(false);
    }

    if (!res.ok) {
      // console.error("Failed to edit card:", data.message);
      toast.error(data.message || "Failed to edit card");
      return;
    }
    toast.success("Card edited successfully!");
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId ? { ...card, name: newName } : card
      )
    );
  };

  const onDeleteCard = async (cardId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/card/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to delete card");
      }
      setCards((prev) => prev.filter((card) => card._id !== cardId));
      toast.success("Card deleted successfully!");
    } catch (error) {
      console.error("Delete card error:", error);
      toast.error("Failed to delete card.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSearch = () => {
    const results: { cardName: string; bond: Bond }[] = [];

    cards.forEach((card) => {
      card.prizeBonds?.forEach((bond) => {
        if (bond.number.toString() === search.trim()) {
          results.push({ cardName: card.name, bond });
        }
      });
    });

    setSearchResults(results);
    setHasSearched(true);
  };
  useEffect(() => {
    if (search.trim() === "") {
      setHasSearched(false);
      setSearchResults([]);
    }
  }, [search]);

  if (loading) {
    return <CardSkeletonGrid />;
  }

  return (
    <>
      {hasCards && (
        <div className="flex justify-between items-center py-20 px-5">
          {/* add card  */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild className="">
              <Button variant="outline" className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Add More Card
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Card</DialogTitle>
                <DialogClose />
              </DialogHeader>

              <Input
                type="text"
                placeholder="Enter card name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mb-4"
              />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button onClick={() => handleCreate(() => setCardName(""))}>
                    Create
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          {/* search  */}
          <div className="w-full max-w-xl ">
            <div className="flex gap-3 items-center">
              <Input
                type="text"
                placeholder="Enter winning bond number"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d*$/.test(value)) {
                    setSearch(value);
                  }
                }}
                className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white"
              />

              <Button
                onClick={handleSearch}
                className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
              >
                Search
              </Button>
            </div>

            {searchResults.length > 0 && hasSearched && (
              <div className="mt-6 p-5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
                  Matching Bonds:
                </h3>
                <ul className="space-y-4">
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="text-sm border-b border-neutral-300 dark:border-neutral-700 pb-3 last:border-0"
                    >
                      <p className="text-black dark:text-white capitalize">
                        <span className="font-semibold">Card:</span>{" "}
                        {result.cardName}
                      </p>
                      <p className="text-black dark:text-white">
                        <span className="font-semibold capitalize">
                          Bond Number:
                        </span>{" "}
                        {result.bond.number}
                      </p>
                      <p className="text-black dark:text-white capitalize">
                        <span className="font-semibold">Purchase Date:</span>{" "}
                        {new Date(
                          result.bond.purchaseDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-black dark:text-white">
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={
                            result.bond.status === "hold"
                              ? "text-green-600 dark:text-green-400"
                              : result.bond.status === "win"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : result.bond.status === "sell"
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          }
                        >
                          {result.bond.status.charAt(0).toUpperCase() +
                            result.bond.status.slice(1)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasSearched && searchResults.length === 0 && (
              <div className="mt-6 text-sm text-red-600 dark:text-red-400 font-medium">
                No matching bonds found.
              </div>
            )}
          </div>
        </div>
      )}

      {!hasCards ? (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <h2 className="text-2xl font-semibold">No Cards Yet</h2>
              <p className="text-muted-foreground text-sm mt-1">
                You haven&apos;t created any bond cards yet.
              </p>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    disabled={isLoading}
                    className="w-full flex gap-2 justify-center"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Create Your First Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogClose asChild>
                      <button
                        aria-label="Close"
                        className="absolute top-3 right-3 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </DialogClose>
                  </DialogHeader>

                  <Input
                    type="text"
                    placeholder="Enter card name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mb-4"
                  />

                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        onClick={() => handleCreate(() => setCardName(""))}
                      >
                        Create
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className=" flex items-center justify-center p-4 bg-white">
          <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
            {cards.map(({ _id, name, totalBond, totalWin }) => (
              <div key={_id} className="min-w-[280px]">
                <BondCard
                  cardId={_id}
                  name={name}
                  totalBond={totalBond}
                  totalWin={totalWin}
                  onAddBond={handleAddBond}
                  onDeleteCard={onDeleteCard}
                  onEditCard={onEditCard}
                  loading={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
