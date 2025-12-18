import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CustomerOrmEntity } from "./customer.orm-entity";
import { CustomerId, Email, PhoneNumber } from "../../domain/value-objects";
import { Customer } from "../../domain/entities/customer.entity";
import { FindAllCustomerInputDto } from "../../application/dto";
import { CustomerNotFoundError } from "../../domain/errors";

@Injectable()
export class CustomerRepositoryAdapter implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>
  ) {}

  private static readonly SORT_BY_COLUMN_MAP = {
    availableCredit: "customer.availableCredit",
    name: "customer.name",
    createdAt: "customer.createdAt",
  } as const;

  private static normalizeSortOrder(raw: unknown): "ASC" | "DESC" {
    if (typeof raw !== "string") return "ASC";
    const upper = raw.toUpperCase();
    if (upper === "ASC" || upper === "DESC") return upper;
    return "ASC";
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const customer = await this.repo.findOne({ where: { id: id.getValue() } });
    return customer ? CustomerOrmEntity.toDomain(customer) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const orm = CustomerOrmEntity.fromDomain(customer);

    const saved = await this.repo.save(orm);
    return CustomerOrmEntity.toDomain(saved);
  }

  async delete(id: CustomerId): Promise<void> {
    await this.repo.softDelete(id.getValue());
  }

  async findByEmailAndPhoneNumber(
    email: Email,
    phoneNumber: PhoneNumber
  ): Promise<Customer | null> {
    const customer = await this.repo.findOne({
      where: { email: email.getValue(), phoneNumber: phoneNumber.getValue() },
    });
    return customer ? CustomerOrmEntity.toDomain(customer) : null;
  }

  async findAll(
    query: FindAllCustomerInputDto
  ): Promise<{ customers: Customer[]; total: number }> {
    const qb = this.repo.createQueryBuilder("customer");

    // Never interpolate user-provided values into SQL identifiers.
    // Map the client-facing sort keys to a safelisted column set.
    const rawSortBy = (query as unknown as { sortBy?: unknown }).sortBy;
    if (typeof rawSortBy === "string") {
      const sortBy =
        rawSortBy as keyof typeof CustomerRepositoryAdapter.SORT_BY_COLUMN_MAP;
      const column = CustomerRepositoryAdapter.SORT_BY_COLUMN_MAP[sortBy];
      if (column) {
        qb.orderBy(
          column,
          CustomerRepositoryAdapter.normalizeSortOrder(
            (query as unknown as { sortOrder?: unknown }).sortOrder
          )
        );
      }
      // If sortBy is invalid, ignore sorting (alternatively: throw a controlled validation error).
    }

    if (query.page != null && query.pageSize != null) {
      const page = Math.max(1, query.page);
      const pageSize = Math.max(1, query.pageSize);
      qb.skip((page - 1) * pageSize).take(pageSize);
    }

    const [rows, total] = await qb.getManyAndCount();
    return {
      customers: rows.map((row) => CustomerOrmEntity.toDomain(row)),
      total,
    };
  }

  async update(id: CustomerId, customer: Partial<Customer>): Promise<Customer> {
    const existing = await this.repo.findOne({ where: { id: id.getValue() } });
    if (!existing) {
      throw new CustomerNotFoundError(id);
    }

    // Only allow updating persistable fields; ignore domain methods / readonly metadata.
    if (customer.name !== undefined) {
      existing.name = String(customer.name).trim();
    }

    if (customer.email !== undefined) {
      const raw = (customer as unknown as { email: Email | string }).email;
      existing.email = typeof raw === "string" ? raw : raw.getValue();
    }

    if (customer.phoneNumber !== undefined) {
      const raw = (customer as unknown as { phoneNumber: PhoneNumber | string })
        .phoneNumber;
      existing.phoneNumber = typeof raw === "string" ? raw : raw.getValue();
    }

    if (customer.availableCredit !== undefined) {
      const raw = (customer as unknown as { availableCredit: unknown })
        .availableCredit;
      const next =
        typeof raw === "number"
          ? raw
          : typeof (raw as any)?.getValue === "function"
          ? Number((raw as any).getValue())
          : Number(raw);
      existing.availableCredit = next;
    }

    const saved = await this.repo.save(existing);
    return CustomerOrmEntity.toDomain(saved);
  }

  async addAvailableCredit(id: CustomerId, amount: number): Promise<Customer> {
    const existing = await this.repo.findOne({ where: { id: id.getValue() } });
    if (!existing) {
      throw new CustomerNotFoundError(id);
    }

    const current = Number(existing.availableCredit);
    existing.availableCredit = current + amount;

    const saved = await this.repo.save(existing);
    return CustomerOrmEntity.toDomain(saved);
  }
}
