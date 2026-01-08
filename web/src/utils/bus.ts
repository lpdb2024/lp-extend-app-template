import mitt from "mitt";

type Events = {
  sendMessage: string;
};

export const emitter = mitt<Events>(); // inferred as Emitter<Events>
export const useBus = () => ({ emitter });
