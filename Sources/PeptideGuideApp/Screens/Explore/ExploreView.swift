import SwiftUI

struct ExploreView: View {
    @EnvironmentObject private var store: AppStore
    @FocusState private var isSearchFocused: Bool

    private let columns = [
        GridItem(.adaptive(minimum: 260, maximum: 360), spacing: AppSpacing.lg),
    ]

    private var results: [Compound] {
        store.sorted(store.filteredCompounds())
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.xl) {
                AppHeader(
                    title: "Explore All Compounds",
                    subtitle: "Search by name, category, tags, or summary text."
                )

                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    TextField(
                        "",
                        text: $store.searchText,
                        prompt: Text("Search compounds")
                            .foregroundStyle(AppColors.textSecondary.opacity(0.65))
                    )
                        .textFieldStyle(.plain)
                        .font(AppTypography.body)
                        .foregroundStyle(AppColors.textPrimary)
                        .focused($isSearchFocused)
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, AppSpacing.sm)
                        .background(AppColors.cardBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(isSearchFocused ? AppColors.selectedOutline : AppColors.border, lineWidth: isSearchFocused ? 2 : 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                    FilterChipBar(
                        tags: store.allTags,
                        selected: store.selectedTags,
                        onToggle: store.toggleTag
                    )
                }

                if store.searchText.isEmpty {
                    SavedSection(title: "Trending", subtitle: "High-interest compounds worth opening first.") {
                        LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                            ForEach(store.trendingCompounds) { compound in
                                CompoundMiniCard(
                                    compound: compound,
                                    isSaved: store.isSaved(compound),
                                    onSelect: { store.selectCompound(compound) },
                                    onSave: { store.toggleSaved(compound: compound) }
                                )
                            }
                        }
                    }

                    SavedSection(title: "Recently viewed") {
                        if store.recentlyViewed.isEmpty {
                            Text("No recently viewed compounds yet.")
                                .font(AppTypography.body)
                                .foregroundStyle(AppColors.textSecondary)
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

                SavedSection(title: store.searchText.isEmpty ? "All compounds" : "Results") {
                    if results.isEmpty {
                        EmptyStateView(
                            title: "No Matches Found",
                            systemImage: "magnifyingglass",
                            message: "Try a different search term or clear the selected tags."
                        )
                        .frame(height: 240)
                    } else {
                        LazyVGrid(columns: columns, spacing: AppSpacing.lg) {
                            ForEach(results) { compound in
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
            }
            .padding(AppSpacing.xxl)
        }
        .background(AppColors.background)
        .toolbar {
            Button("Focus Search") {
                isSearchFocused = true
            }
            .keyboardShortcut("f", modifiers: .command)
        }
    }
}
