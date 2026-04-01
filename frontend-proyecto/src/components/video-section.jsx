import { Play } from "lucide-react";
import { useRef, useState } from "react";

export default function VideoSection() {
  const videos = [
    {
      id: "VIDEO_ID_1",
      title: "Cómo gestionar turnos",
      description: "Aprendé a crear, editar y cancelar turnos fácilmente.",
    },
    {
      id: "VIDEO_ID_2",
      title: "Administrar alumnos",
      description: "Controlá asistencia, estados y datos importantes.",
    },
    {
      id: "VIDEO_ID_3",
      title: "Gestión de pagos",
      description: "Manejá planes, cobros y vencimientos.",
    },
  ];

  const [videoId, setVideoId] = useState(videos[0].id);
  const [showMore, setShowMore] = useState(false);

  // 👇 referencia al video
  const videoRef = useRef(null);

  const handleChangeVideo = (id) => {
    setVideoId(id);

    setTimeout(() => {
      videoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <section className="w-full">
      <div className="flex flex-col items-center text-center w-full gap-8">
        <h2 className="text-3xl font-semibold">Cómo funciona TurnoFacil</h2>
        <p className="text-gray-600">
          Descubrí lo fácil que es gestionar tu negocio en pocos minutos.
        </p>

        <div ref={videoRef} className="w-[90%] md:w-[80%]">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-xl shadow-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Video"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <button
          onClick={() => setShowMore(!showMore)}
          className="text-[#efefef] bg-[#333] rounded-[13px] px-4 py-2 border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
        >
          {showMore ? "Ocultar videos" : "Ver más"}
        </button>

        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-[80%] animate-fadeIn">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleChangeVideo(video.id)}
                className="cursor-pointer group border border-gray-300 rounded-xl"
              >
                <div className="relative bg-gray-200 rounded-xl aspect-video flex items-center justify-center ">
                  <div className="bg-black/60 p-4 rounded-full group-hover:scale-110 transition">
                    <Play className="text-white" size={28} />
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
