import AppKit
import SwiftUI

struct CompoundDetailView: View {
    let compound: Compound

    @EnvironmentObject private var store: AppStore

    private var readingSpacing: CGFloat {
        store.readingDensity == .comfortable ? AppSpacing.xl : AppSpacing.md
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: readingSpacing) {
                CompoundTitleBlock(compound: compound)
                SummaryPanel(summary: compound.summary)
                DetailSectionCard(title: "What it does in the body", content: compound.mechanism)
                DetailSectionCard(title: "Potential benefits being studied", content: compound.benefits)
                DetailSectionCard(title: "Research snapshot", content: compound.research)
                ResourceList(resources: compound.resources)
                DetailActionBar(
                    isSaved: store.isSaved(compound),
                    onSave: { store.toggleSaved(compound: compound) },
                    onCompare: { _ = store.addToCompare(compound) },
                    onShare: shareCompound
                )
            }
            .frame(maxWidth: 780, alignment: .leading)
            .padding(.horizontal, AppSpacing.xxl)
            .padding(.top, AppSpacing.xxl + AppSpacing.sm)
            .padding(.bottom, AppSpacing.xxl)
            .frame(maxWidth: .infinity)
        }
        .background(AppColors.background)
    }

    private func shareCompound() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(compound.name, forType: .string)
    }
}
