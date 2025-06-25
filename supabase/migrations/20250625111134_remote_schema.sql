create type "public"."tipo_movimentacao" as enum ('Entrada', 'Saída', 'Ajuste');

create sequence "public"."categorias_id_seq";

alter table "public"."movimentacoes_estoque" drop constraint "movimentacoes_estoque_produto_id_fkey";

alter table "public"."movimentacoes_estoque" drop constraint "movimentacoes_estoque_tipo_check";

create table "public"."categorias" (
    "id" integer not null default nextval('categorias_id_seq'::regclass),
    "nome" text not null
);


alter table "public"."movimentacoes_estoque" drop column "destino";

alter table "public"."movimentacoes_estoque" alter column "data" set default now();

alter table "public"."movimentacoes_estoque" alter column "data" set data type timestamp with time zone using "data"::timestamp with time zone;

alter table "public"."movimentacoes_estoque" alter column "id" drop default;

alter table "public"."movimentacoes_estoque" alter column "id" add generated always as identity;

alter table "public"."movimentacoes_estoque" alter column "id" set data type bigint using "id"::bigint;

alter table "public"."movimentacoes_estoque" alter column "origem" set not null;

alter table "public"."movimentacoes_estoque" alter column "produto_id" set not null;

alter table "public"."movimentacoes_estoque" alter column "produto_id" set data type bigint using "produto_id"::bigint;

alter table "public"."movimentacoes_estoque" alter column "quantidade" set not null;

alter table "public"."movimentacoes_estoque" alter column "tipo" set not null;

alter table "public"."produtos" drop column "categoria";

alter table "public"."produtos" add column "categoria_id" integer;

alter sequence "public"."categorias_id_seq" owned by "public"."categorias"."id";

drop sequence if exists "public"."movimentacoes_estoque_id_seq";

CREATE UNIQUE INDEX categorias_nome_key ON public.categorias USING btree (nome);

CREATE UNIQUE INDEX categorias_pkey ON public.categorias USING btree (id);

CREATE INDEX idx_produto_id ON public.movimentacoes_estoque USING btree (produto_id);

alter table "public"."categorias" add constraint "categorias_pkey" PRIMARY KEY using index "categorias_pkey";

alter table "public"."categorias" add constraint "categorias_nome_key" UNIQUE using index "categorias_nome_key";

alter table "public"."produtos" add constraint "produtos_categoria_id_fkey" FOREIGN KEY (categoria_id) REFERENCES categorias(id) not valid;

alter table "public"."produtos" validate constraint "produtos_categoria_id_fkey";

alter table "public"."movimentacoes_estoque" add constraint "movimentacoes_estoque_produto_id_fkey" FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE not valid;

alter table "public"."movimentacoes_estoque" validate constraint "movimentacoes_estoque_produto_id_fkey";

alter table "public"."movimentacoes_estoque" add constraint "movimentacoes_estoque_tipo_check" CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saída'::text]))) not valid;

alter table "public"."movimentacoes_estoque" validate constraint "movimentacoes_estoque_tipo_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_movimentacoes_estoque()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.movimentacoes_estoque (produto_id, quantidade, tipo, data, origem)
    VALUES (NEW.id, 0, 'entrada', NOW(), 'criação do produto');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_product(p_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
  DELETE FROM produtos WHERE id = p_id;
END;$function$
;

grant delete on table "public"."categorias" to "anon";

grant insert on table "public"."categorias" to "anon";

grant references on table "public"."categorias" to "anon";

grant select on table "public"."categorias" to "anon";

grant trigger on table "public"."categorias" to "anon";

grant truncate on table "public"."categorias" to "anon";

grant update on table "public"."categorias" to "anon";

grant delete on table "public"."categorias" to "authenticated";

grant insert on table "public"."categorias" to "authenticated";

grant references on table "public"."categorias" to "authenticated";

grant select on table "public"."categorias" to "authenticated";

grant trigger on table "public"."categorias" to "authenticated";

grant truncate on table "public"."categorias" to "authenticated";

grant update on table "public"."categorias" to "authenticated";

grant delete on table "public"."categorias" to "service_role";

grant insert on table "public"."categorias" to "service_role";

grant references on table "public"."categorias" to "service_role";

grant select on table "public"."categorias" to "service_role";

grant trigger on table "public"."categorias" to "service_role";

grant truncate on table "public"."categorias" to "service_role";

grant update on table "public"."categorias" to "service_role";

CREATE TRIGGER after_insert_produto AFTER INSERT ON public.produtos FOR EACH ROW EXECUTE FUNCTION update_movimentacoes_estoque();


