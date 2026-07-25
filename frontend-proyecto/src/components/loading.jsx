import { Player } from "@lottiefiles/react-lottie-player";
import animation from "../assets/clock.json";

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full">
      <Player
        autoplay
        loop
        src={animation}
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
}
