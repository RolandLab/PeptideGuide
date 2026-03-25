import SwiftUI

struct LaneView: View {
    let category: CompoundCategory

    @EnvironmentObject private var store: AppStore

    private let columns = [
        GridItem(.adaptive(minimum: 260, maximum: 360), spacing: AppSpacing.lg),
    ]

    private var compounds: [Compound] {
        store.sorted(store.filteredCompounds(category: category))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xl) {
                AppHeader(title: category.title, subtitle: category.subtitle)

                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                    SortMenu(selection: $store.sortOption)

                    Text("Filter by tag")
                        .font(AppTypography.meta)
                        .foregroundStyle(AppColors.textSecondary)

                    FilterChipBar(
                        tags: store.availableTags(for: category),
                        selected: store.selectedTags,
                        onToggle: store.toggleTag
                    )
                }

                if compounds.isEmpty {
                    EmptyStateView(
                        title: "No Matching Compounds",
                        systemImage: "line.3.horizontal.decrease.circle",
                        message: "Clear one or more tags to see the full lane again."
                    )
                    .frame(height: 260)
                } else {
                    LazyVGrid(columns: columns, spacing: AppSpacing.lg) {
                        ForEach(compounds) { compound in
                            CompoundCard(
                                compound: compound,
                                isSaved: store.isSaved(compound),
                                onSelect: { store.selectCompound(compound) },
                                onSave: { store.toggleSaved(compound: compound) }
                            )
                        }
                    }
                }
            }
            .padding(AppSpacing.xxl)
        }
        .background(AppColors.background)
    }
}
