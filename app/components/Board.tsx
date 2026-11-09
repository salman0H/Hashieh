"use client";
import { useMemo, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowUpLeft, Check } from "lucide-react";
import { boardNodes, boardConnections } from "../lib/presentation";
import type { LessonSummary } from "../lib/types";
function PaperNode({ data }: NodeProps) {
  const d = data as {
    lesson: LessonSummary;
    rotate: number;
    done: boolean;
    open: (id: string) => void;
    index: number;
  };
  const paper = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(paper.current, {
        opacity: 0,
        y: 35,
        scale: 0.88,
        duration: 0.85,
        delay: d.index * 0.08,
        ease: "back.out(1.3)",
      });
    });
    return () => mm.revert();
  }, [d.index]);
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <button
        ref={paper}
        className={`node-paper paper-${d.index % 3}`}
        style={{ rotate: `${d.rotate}deg` }}
        onClick={() => d.open(d.lesson.id)}
      >
        <span className="tape" />
        <span className="node-number">
          {String(d.index + 1).padStart(2, "0")}{" "}
          <span>{d.done ? <Check size={14} /> : d.lesson.category}</span>
        </span>
        <small dir="ltr">{d.lesson.english}</small>
        <strong>{d.lesson.title}</strong>
        <p>{d.lesson.description}</p>
        <span className="node-foot">
          {d.done ? "مطالعه شده" : "باز کردن مبحث"}
          <ArrowUpLeft size={17} />
        </span>
      </button>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
const nodeTypes = { paper: PaperNode };
export default function Board({
  lessons,
  completed,
  open,
}: {
  lessons: LessonSummary[];
  completed: string[];
  open: (id: string) => void;
}) {
  const nodes = useMemo(
    () =>
      boardNodes.flatMap((n, i) => {
        const lesson = lessons.find((l) => l.id === `concept-${n.key}`);
        return lesson
          ? [
              {
                id: n.key,
                type: "paper",
                position: { x: n.x, y: n.y },
                data: {
                  lesson,
                  index: i,
                  rotate: n.rotate,
                  done: completed.includes(lesson.id),
                  open,
                },
              },
            ]
          : [];
      }),
    [lessons, completed, open],
  );
  const edges = useMemo(
    () =>
      boardConnections.map(([a, b], i) => ({
        id: `e${i}`,
        source: boardNodes[a].key,
        target: boardNodes[b].key,
        type: "smoothstep",
        style: { stroke: "#adbaa0", strokeWidth: 1.5, strokeDasharray: "5 6" },
      })),
    [],
  );
  return (
    <div className="board-shell" dir="ltr">
      <div className="board-caption">
        <span className="live-dot" /> YOUR LEARNING, CONNECTED{" "}
        <span>01 — THE ENGLISH ROOM</span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.13, minZoom: 0.62, maxZoom: 0.95 }}
        minZoom={0.35}
        maxZoom={1.4}
        nodesDraggable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        attributionPosition="top-right"
      >
        <Background color="#a8bea6" gap={24} size={0.65} />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="board-legend" dir="rtl">
        هر برگه، یک مبحث · خط‌ها ارتباط موضوع‌ها را نشان می‌دهند{" "}
        <span>برای جابه‌جایی تخته بکش</span>
      </div>
    </div>
  );
}
