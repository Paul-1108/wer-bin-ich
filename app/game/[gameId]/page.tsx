import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { GameShell } from "@/components/ui/game/GameShell";
import { getGameView } from "@/lib/game/queries";
import { PLAYER_TOKEN_KEY } from "@/lib/game/player-token";

export const dynamic = "force-dynamic";

type GamePageProps = PageProps<"/game/[gameId]">;

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const parsedGameId = Number(gameId);

  if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
    notFound();
  }

  const playerToken = (await cookies()).get(PLAYER_TOKEN_KEY)?.value;
  const game = await getGameView(parsedGameId, playerToken);

  if (!game) {
    notFound();
  }

  return <GameShell game={game} />;
}
