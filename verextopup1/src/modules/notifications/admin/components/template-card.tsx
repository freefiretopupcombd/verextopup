"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateTemplateAction, type ActionState } from "../../actions";

const initialState: ActionState = { success: false };

export function TemplateCard({ template }: { template: any }) {
  const router = useRouter();
  const action = updateTemplateAction.bind(null, template.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Template update হয়েছে");
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="bg-bg-card border border-border rounded-xl p-5 space-y-4"
    >
      <div>
        <div className="text-[10px] font-mono text-primary font-bold">
          {template.key}
        </div>
        <div className="flex items-center justify-between mt-2">
          <h3 className="font-bold text-text-primary text-sm">
            {template.key.replace(/_/g, " ")}
          </h3>
          <span className="text-[10px] text-text-muted">
            {template.channel}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Subject
        </label>
        <input
          name="subject"
          type="text"
          defaultValue={template.subject || ""}
          placeholder="Email subject"
          className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Body
        </label>
        <textarea
          name="body"
          rows={5}
          required
          defaultValue={template.body}
          placeholder="Message body"
          className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:outline-none focus:border-primary resize-none font-mono"
        />
        <p className="mt-1 text-[10px] text-text-dim">
          Variables: {"{name}"}, {"{orderNumber}"}, {"{amount}"}, {"{reason}"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={template.isActive}
            className="w-3.5 h-3.5 text-primary rounded"
          />
          <span className="text-text-primary">Active</span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-gradient-primary text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}