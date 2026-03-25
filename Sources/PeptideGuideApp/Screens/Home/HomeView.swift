import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: AppStore

    private let columns = [
        GridItem(.adaptive(minimum: 260, maximum: 360), spacing: AppSpacing.lg),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xxl) {
                AppHeader(
                    title: "Explore compounds by goal",
                    subtitle: "Mechanisms, research, and potential benefits organized into focused lanes."
                )

                GoalCardGrid(categories: CompoundCategory.allCases) { category in
                    store.selectSidebarItem(.lane(category))
                }

                if store.showSuggestedSection {
                    SavedSection(
                        title: "Suggested for you",
                        subtitle: "A curated starting set for fast exploration."
                    ) {
                        LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                            ForEach(store.suggestedCompounds) { compound in
                                CompoundMiniCard(
                                    compound: compound,
                                    isSaved: store.isSaved(compound),
                                    onSelect: { store.selectCompound(compound) },
                                    onSave: { store.toggleSaved(compound: compound) }
                                )
                            }
                        }
                    }
                }

                SavedSection(
                    title: "Recently viewed",
                    subtitle: "Shortcuts back to compounds you opened in the detail pane."
                ) {
                    if store.recentlyViewed.isEmpty {
                        EmptyStateView(
                            title: "No Recent Compounds",
                            systemImage: "clock.arrow.circlepath",
                            message: "Open a compound from any lane or from Explore to populate this section."
                        )
                        .frame(height: 180)
                    } else {
                        LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                            ForEach(store.recentlyViewed) { compound in
                                CompoundMiniCard(
                                    compound: compound,
                                    isSaved: store.isSaved(compound),
                                    onSelect: { store.selectCompound(compound) },
                                    onSave: { store.toggleSaved(compound: compound) }
                                )
                            }
                        }
                    }
                }
            }
            .padding(AppSpacing.xxl)
            .frame(maxWidth: 980, alignment: .leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(AppColors.background)
    }
}
