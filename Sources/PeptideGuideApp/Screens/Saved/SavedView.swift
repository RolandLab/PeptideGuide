import SwiftUI

struct SavedView: View {
    @EnvironmentObject private var store: AppStore

    private let columns = [
        GridItem(.adaptive(minimum: 260, maximum: 360), spacing: AppSpacing.lg),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xxl) {
                AppHeader(
                    title: "Saved",
                    subtitle: "Return to important compounds and saved comparison sets."
                )

                if store.savedCompoundItems.isEmpty && store.savedCompareSets.isEmpty {
                    EmptyStateView(
                        title: "Nothing Saved Yet",
                        systemImage: "bookmark",
                        message: "Save compounds from a card or detail page, or save a compare set from the Compare screen."
                    )
                    .frame(height: 320)
                } else {
                    SavedSection(title: "Saved compounds") {
                        if store.savedCompoundItems.isEmpty {
                            Text("No compounds saved yet.")
                                .font(AppTypography.body)
                                .foregroundStyle(AppColors.textSecondary)
                        } else {
                            LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                                ForEach(store.savedCompoundItems) { compound in
                                    CompoundMiniCard(
                                        compound: compound,
                                        isSaved: true,
                                        onSelect: { store.selectCompound(compound) },
                                        onSave: { store.toggleSaved(compound: compound) }
                                    )
                                }
                            }
                        }
                    }

                    SavedSection(title: "Saved compare sets") {
                        if store.savedCompareSets.isEmpty {
                            Text("No compare sets saved yet.")
                                .font(AppTypography.body)
                                .foregroundStyle(AppColors.textSecondary)
                        } else {
                            LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                                ForEach(store.savedCompareSets) { compareSet in
                                    CompareSetCard(
                                        compareSet: compareSet,
                                        compounds: store.allCompounds.filter { compareSet.compoundIDs.contains($0.id) },
                                        onOpen: { store.openCompareSet(compareSet) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
            .padding(AppSpacing.xxl)
        }
        .background(AppColors.background)
    }
}
