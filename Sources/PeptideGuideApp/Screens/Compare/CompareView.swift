import SwiftUI

struct CompareView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isPickerPresented = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xl) {
                AppHeader(
                    title: "Compare Compounds",
                    subtitle: "Compare 2-3 compounds side by side across mechanism, systems, and research framing."
                )

                CompareSelectionBar(
                    compounds: store.compareCompounds,
                    onSelect: store.selectCompound,
                    onRemove: store.removeFromCompare,
                    onAdd: { isPickerPresented = true },
                    onSaveSet: store.saveCurrentCompareSet
                )

                if store.compareCompounds.count < 2 {
                    EmptyStateView(
                        title: "Build a Comparison",
                        systemImage: "square.split.2x2",
                        message: "Add at least two compounds to render the desktop comparison table."
                    )
                    .frame(height: 280)
                } else {
                    ComparisonTable(compounds: store.compareCompounds)
                }
            }
            .padding(AppSpacing.xxl)
        }
        .background(AppColors.background)
        .sheet(isPresented: $isPickerPresented) {
            CompoundPickerSheet(
                compounds: store.allCompounds,
                selected: store.compareCompounds,
                onSelect: { compound in
                    if store.addToCompare(compound) {
                        store.selectCompound(compound)
                    }
                },
                onDismiss: { isPickerPresented = false }
            )
        }
    }
}
