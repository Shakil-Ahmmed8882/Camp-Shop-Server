import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Exclude specific fields from filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    // Add category filter if present
    if (queryObj.category) {
      this.modelQuery = this.modelQuery.find({
        category: queryObj.category as string,
      });
      delete queryObj.category;
    }

    // Add price range filter if present
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceFilter: Record<string, unknown> = {};
      if (queryObj.minPrice) {
        priceFilter.$gte = Number(queryObj.minPrice);
        delete queryObj.minPrice;
      }
      if (queryObj.maxPrice) {
        priceFilter.$lte = Number(queryObj.maxPrice);
        delete queryObj.maxPrice;
      }

      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      });
    }

    // Apply other remaining filters
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    const sortOption = this.query?.sort as string;
    let sort = '-createdAt'; // default sort

    if (sortOption) {
      if (sortOption === 'priceAsc') {
        sort = 'price';
      } else if (sortOption === 'priceDesc') {
        sort = '-price';
      } else {
        sort = sortOption.split(',').join(' ');
      }
    }

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }

  clearFilters() {
    this.query = {};
    this.modelQuery = this.modelQuery.find({});
    return this;
  }
}

export default QueryBuilder;
