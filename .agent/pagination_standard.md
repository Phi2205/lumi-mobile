# Tiêu chuẩn Phân trang trong React Native (Pagination Standard)

Phân trang là yếu tố quan trọng ảnh hưởng đến hiệu năng của thiết bị di động. Tài liệu này định nghĩa cách triển khai phân trang danh sách (List Pagination) bằng `FlatList` trong React Native.

---

## 📋 Yêu cầu kỹ thuật
1. **Lazy Loading / Infinite Scroll**: Chỉ tải trang tiếp theo khi người dùng cuộn đến gần cuối danh sách.
2. **Pull-to-Refresh**: Cho phép kéo xuống đầu trang để làm mới danh sách (tải lại từ trang đầu tiên).
3. **Loading Indicator**: Hiển thị vòng xoay tải dữ liệu ở cuối trang khi đang tải trang tiếp theo (Footer loader) và toàn màn hình khi tải trang đầu tiên.
4. **Empty State**: Hiển thị thông báo thân thiện khi danh sách trống.

---

## 🛠️ Triển khai mẫu với FlatList

### 1. Phân trang dạng Cursor / Page-Offset (Service layer)
Dữ liệu phân trang trả về từ API thường có dạng:
```typescript
interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
```

### 2. Sử dụng Custom Hook (kết hợp với Infinite Query)
Nếu sử dụng React Query (TanStack Query), hãy tận dụng `useInfiniteQuery`:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { PostRepository } from '@/services/post.service';

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => PostRepository.getPosts(pageParam, 10),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
```

### 3. Component Giao diện (FlatList UI)

```tsx
import React from 'react';
import { FlatList, ActivityIndicator, Text, View } from 'react-native';
import { useInfinitePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/post-card';
import { Spacing } from '@/constants/theme';

export default function PostListScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isPending,
    isRefetching
  } = useInfinitePosts();

  const posts = data?.pages.flatMap(page => page.items) ?? [];

  // 1. Footer loader khi tải trang tiếp theo
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: Spacing.three }}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  };

  // 2. Refresh Control
  const handleRefresh = () => {
    refetch();
  };

  // 3. Tải tiếp khi cuộn gần tới cuối trang
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isPending) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PostCard post={item} />}
      
      // Xử lý Infinite Scroll
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5} // Tải trước khi cuộn còn 50% màn hình cuối
      ListFooterComponent={renderFooter}

      // Xử lý Pull-to-Refresh
      refreshing={isRefetching}
      onRefresh={handleRefresh}

      // Empty State
      ListEmptyComponent={
        <View style={{ alignItems: 'center', padding: Spacing.five }}>
          <Text>Không có bài viết nào.</Text>
        </View>
      }
    />
  );
}
```
