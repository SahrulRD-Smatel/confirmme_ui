import { Player } from "@lottiefiles/react-lottie-player";

interface LoadingScreenProps {
  animationData: object;
}

const LoadingScreen = ({ animationData }: LoadingScreenProps) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <Player
        autoplay
        loop
        src={JSON.stringify(animationData)}
        style={{ height: "300px", width: "300px" }}
      />
    </div>
  );
};

export default LoadingScreen;
