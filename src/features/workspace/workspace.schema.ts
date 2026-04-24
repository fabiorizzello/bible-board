import { Group, co, z } from "jazz-tools";
import { ElementoSchema } from "@/features/elemento/elemento.schema";
import { BoardSchema } from "@/features/board/board.schema";
import { createInitialWorkspace } from "@/features/workspace/workspace.rules";

export const TagRegistrationSchema = co.map({
  tag: z.string(),
  colore: z.string().optional(),
  elementoDescrittivoId: z.string().optional()
});

export const TimelineBoardProfile = co.profile();

export const WorkspaceSchema = co.map({
  nome: z.string(),
  descrizione: z.string().optional(),
  createdAt: z.string(),
  boards: co.list(BoardSchema),
  tagRegistry: co.list(TagRegistrationSchema),
  elementi: co.list(ElementoSchema)
});

export const TimelineBoardRoot = co.map({
  workspace: WorkspaceSchema
});

export const TimelineBoardAccount = co
  .account({
    root: TimelineBoardRoot,
    profile: TimelineBoardProfile
  })
  .withMigration((account, creationProps?: { name?: string }) => {
    if (account.root === undefined) {
      const initialWorkspace = createInitialWorkspace({
        accountId: account.id,
        preferredName: creationProps?.name
      });

      account.root = TimelineBoardRoot.create(
        {
          workspace: WorkspaceSchema.create(
            {
              ...initialWorkspace,
              boards: co.list(BoardSchema).create([], account),
              tagRegistry: co.list(TagRegistrationSchema).create([], account),
              elementi: co.list(ElementoSchema).create([], account)
            },
            account
          )
        },
        account
      );
    }

    // Migrate existing workspaces that pre-date the boards CoList (old boardIds schema)
    if (account.root?.workspace !== undefined && (account.root.workspace as any).boards === undefined) {
      (account.root.workspace as any).boards = co.list(BoardSchema).create([], account);
    }

    if (account.profile === undefined) {
      const profileGroup = Group.create({ owner: account });
      profileGroup.addMember("everyone", "reader");
      account.profile = TimelineBoardProfile.create(
        {
          name: creationProps?.name?.trim() || "Nuovo utente"
        },
        profileGroup
      );
    }
  });

declare module "jazz-react" {
  interface Register {
    Account: typeof TimelineBoardAccount;
  }
}
