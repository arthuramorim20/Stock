create sequence "public"."movimentacoes_estoque_id_seq";

create sequence "public"."produtos_id_seq";

create table "public"."movimentacoes_estoque" (
    "id" integer not null default nextval('movimentacoes_estoque_id_seq'::regclass),
    "produto_id" integer,
    "quantidade" integer,
    "tipo" text,
    "data" timestamp without time zone,
    "origem" text,
    "destino" text
);


create table "public"."produtos" (
    "id" integer not null default nextval('produtos_id_seq'::regclass),
    "nome" text not null,
    "descricao" text,
    "preco" numeric(10,2) not null,
    "categoria" text,
    "sku" text not null,
    "estoque" integer default 0,
    "criado_em" timestamp without time zone default now(),
    "stocklevel" character varying(255)
);


alter sequence "public"."movimentacoes_estoque_id_seq" owned by "public"."movimentacoes_estoque"."id";

alter sequence "public"."produtos_id_seq" owned by "public"."produtos"."id";

CREATE UNIQUE INDEX movimentacoes_estoque_pkey ON public.movimentacoes_estoque USING btree (id);

CREATE UNIQUE INDEX produtos_pkey ON public.produtos USING btree (id);

CREATE UNIQUE INDEX produtos_sku_key ON public.produtos USING btree (sku);

alter table "public"."movimentacoes_estoque" add constraint "movimentacoes_estoque_pkey" PRIMARY KEY using index "movimentacoes_estoque_pkey";

alter table "public"."produtos" add constraint "produtos_pkey" PRIMARY KEY using index "produtos_pkey";

alter table "public"."movimentacoes_estoque" add constraint "movimentacoes_estoque_produto_id_fkey" FOREIGN KEY (produto_id) REFERENCES produtos(id) not valid;

alter table "public"."movimentacoes_estoque" validate constraint "movimentacoes_estoque_produto_id_fkey";

alter table "public"."movimentacoes_estoque" add constraint "movimentacoes_estoque_tipo_check" CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saida'::text]))) not valid;

alter table "public"."movimentacoes_estoque" validate constraint "movimentacoes_estoque_tipo_check";

alter table "public"."produtos" add constraint "produtos_estoque_check" CHECK ((estoque >= 0)) not valid;

alter table "public"."produtos" validate constraint "produtos_estoque_check";

alter table "public"."produtos" add constraint "produtos_preco_check" CHECK ((preco >= (0)::numeric)) not valid;

alter table "public"."produtos" validate constraint "produtos_preco_check";

alter table "public"."produtos" add constraint "produtos_sku_key" UNIQUE using index "produtos_sku_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_product(p_id integer)
RETURNS void AS $$
BEGIN
  DELETE FROM products WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_stock_product(produto_id_param integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  estoque_atual int;
begin
  select estoque into estoque_atual
  from produtos
  where id = produto_id_param;

  return estoque_atual;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.obter_estoque_produto(produto_id_param integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  estoque_atual int;
begin
  select estoque into estoque_atual
  from produtos
  where id = produto_id_param;

  return estoque_atual;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.products_low_stock(limite_estoque integer DEFAULT 10)
 RETURNS SETOF produtos
 LANGUAGE plpgsql
AS $function$begin
  return query
  select *
  from produtos
  where estoque <= limite_estoque;
end;$function$
;

CREATE OR REPLACE FUNCTION public.register_moviment(produto_id_param integer, quantidade_param integer, tipo_param text, origem_param text, destino_param text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  ajuste int;
begin
  -- Determinar o valor de ajuste com base no tipo
  if tipo_param = 'entrada' then
    ajuste := quantidade_param;
  elsif tipo_param = 'saida' then
    ajuste := -quantidade_param;
  else
    raise exception 'Tipo inválido: %', tipo_param;
  end if;

  -- Inserir na tabela de movimentações
  insert into movimentacoes_estoque (
    produto_id, quantidade, tipo, data, origem, destino
  ) values (
    produto_id_param, quantidade_param, tipo_param, now(), origem_param, destino_param
  );

  -- Atualizar estoque do produto
  update produtos
  set estoque = estoque + ajuste
  where id = produto_id_param;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.registrar_entrada_apos_criacao_produto()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Apenas insere se o estoque inicial for maior que 0
  if NEW.estoque > 0 then
    insert into movimentacoes_estoque (
      produto_id, quantidade, tipo, data, origem, destino
    ) values (
      NEW.id, NEW.estoque, 'entrada', now(), 'cadastro inicial', 'estoque'
    );
  end if;

  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_stock(p_id integer, p_novo_estoque integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
  update produtos
  set estoque = p_novo_estoque
  where id = p_id;
end;$function$
;

grant delete on table "public"."movimentacoes_estoque" to "anon";

grant insert on table "public"."movimentacoes_estoque" to "anon";

grant references on table "public"."movimentacoes_estoque" to "anon";

grant select on table "public"."movimentacoes_estoque" to "anon";

grant trigger on table "public"."movimentacoes_estoque" to "anon";

grant truncate on table "public"."movimentacoes_estoque" to "anon";

grant update on table "public"."movimentacoes_estoque" to "anon";

grant delete on table "public"."movimentacoes_estoque" to "authenticated";

grant insert on table "public"."movimentacoes_estoque" to "authenticated";

grant references on table "public"."movimentacoes_estoque" to "authenticated";

grant select on table "public"."movimentacoes_estoque" to "authenticated";

grant trigger on table "public"."movimentacoes_estoque" to "authenticated";

grant truncate on table "public"."movimentacoes_estoque" to "authenticated";

grant update on table "public"."movimentacoes_estoque" to "authenticated";

grant delete on table "public"."movimentacoes_estoque" to "service_role";

grant insert on table "public"."movimentacoes_estoque" to "service_role";

grant references on table "public"."movimentacoes_estoque" to "service_role";

grant select on table "public"."movimentacoes_estoque" to "service_role";

grant trigger on table "public"."movimentacoes_estoque" to "service_role";

grant truncate on table "public"."movimentacoes_estoque" to "service_role";

grant update on table "public"."movimentacoes_estoque" to "service_role";

grant delete on table "public"."produtos" to "anon";

grant insert on table "public"."produtos" to "anon";

grant references on table "public"."produtos" to "anon";

grant select on table "public"."produtos" to "anon";

grant trigger on table "public"."produtos" to "anon";

grant truncate on table "public"."produtos" to "anon";

grant update on table "public"."produtos" to "anon";

grant delete on table "public"."produtos" to "authenticated";

grant insert on table "public"."produtos" to "authenticated";

grant references on table "public"."produtos" to "authenticated";

grant select on table "public"."produtos" to "authenticated";

grant trigger on table "public"."produtos" to "authenticated";

grant truncate on table "public"."produtos" to "authenticated";

grant update on table "public"."produtos" to "authenticated";

grant delete on table "public"."produtos" to "service_role";

grant insert on table "public"."produtos" to "service_role";

grant references on table "public"."produtos" to "service_role";

grant select on table "public"."produtos" to "service_role";

grant trigger on table "public"."produtos" to "service_role";

grant truncate on table "public"."produtos" to "service_role";

grant update on table "public"."produtos" to "service_role";


