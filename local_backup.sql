--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.inquiries (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    line_id character varying(100),
    pet_size character varying(20),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inquiries_pet_size_check CHECK (((pet_size)::text = ANY ((ARRAY['small'::character varying, 'medium'::character varying, 'large'::character varying, 'undecided'::character varying])::text[])))
);


ALTER TABLE public.inquiries OWNER TO admin;

--
-- Name: inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.inquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inquiries_id_seq OWNER TO admin;

--
-- Name: inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.inquiries_id_seq OWNED BY public.inquiries.id;


--
-- Name: pets; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pets (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    breed character varying(100) NOT NULL,
    birthdate date,
    age character varying(50),
    gender character varying(10),
    color character varying(100),
    category character varying(20),
    price numeric(10,2),
    description text,
    health text,
    images jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pets_category_check CHECK (((category)::text = ANY ((ARRAY['small'::character varying, 'medium'::character varying, 'large'::character varying])::text[]))),
    CONSTRAINT pets_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


ALTER TABLE public.pets OWNER TO admin;

--
-- Name: pets_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pets_id_seq OWNER TO admin;

--
-- Name: pets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.pets_id_seq OWNED BY public.pets.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_settings OWNER TO admin;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.site_settings_id_seq OWNER TO admin;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    pet_type character varying(100),
    rating integer,
    text text NOT NULL,
    avatar text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.testimonials OWNER TO admin;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.testimonials_id_seq OWNER TO admin;

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: inquiries id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.inquiries ALTER COLUMN id SET DEFAULT nextval('public.inquiries_id_seq'::regclass);


--
-- Name: pets id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pets ALTER COLUMN id SET DEFAULT nextval('public.pets_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.inquiries (id, name, phone, line_id, pet_size, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pets (id, name, breed, birthdate, age, gender, color, category, price, description, health, images, created_at, updated_at) FROM stdin;
1	小黑	邊境牧羊犬	\N	3個月大	male	黑白色	medium	35000.00	活潑聰明的邊境牧羊犬幼犬，已完成基礎訓練	健康狀況良好，已接種疫苗	["images/64805.jpg"]	2025-07-11 14:51:30.732607	2025-07-11 14:51:30.732607
2	小花	柯基犬	\N	2個月大	female	三色	small	38000.00	可愛的柯基犬幼犬，性格溫順	健康狀況良好，已接種疫苗	["images/download.jpg"]	2025-07-11 14:51:30.732607	2025-07-11 14:51:30.732607
3	露西	黃金獵犬	\N	4個月大	female	金色	large	45000.00	溫順的黃金獵犬幼犬，適合家庭飼養	健康狀況良好，已接種疫苗	["images/download-1.jpg"]	2025-07-11 14:51:30.732607	2025-07-11 14:51:30.732607
4	小白	柴犬	\N	4個月大	male	白色	medium	32000.00	忠誠的柴犬幼犬，個性獨立	健康狀況良好，已接種疫苗	["images/download-2.jpg"]	2025-07-11 14:51:30.732607	2025-07-11 14:51:30.732607
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.site_settings (id, setting_key, setting_value, updated_at) FROM stdin;
1	site_title	小基基寵物犬舍	2025-07-11 14:51:30.733496
2	site_description	專業邊境牧羊犬培育	2025-07-11 14:51:30.733496
3	contact_phone	0910-808-283	2025-07-11 14:51:30.733496
4	contact_line	@corgidog	2025-07-11 14:51:30.733496
5	contact_address	高雄市鳳山區文龍東路666號	2025-07-11 14:51:30.733496
6	business_hours	下午13:00 ~ 晚上21:00	2025-07-11 14:51:30.733496
7	license_number	特寵業字第W1141071號	2025-07-11 14:51:30.733496
8	tax_id	00879221	2025-07-11 14:51:30.733496
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.testimonials (id, name, pet_type, rating, text, avatar, is_active, created_at, updated_at) FROM stdin;
1	陳小姐	柯基犬主人	5	從小基基帶回家的柯基寶寶超級健康活潑！老闆很細心地教導飼養方式，還提供了完整的健康記錄。寶寶現在已經成為我們家的開心果了！	images/64805.jpg	t	2025-07-11 14:51:30.73319	2025-07-11 14:51:30.73319
2	林先生	黃金獵犬主人	5	專業的犬舍！環境乾淨整潔，狗狗們都很健康。最感動的是售後服務，老闆會定期關心狗狗的狀況，真的把每隻狗狗都當作家人。	images/download-1.jpg	t	2025-07-11 14:51:30.73319	2025-07-11 14:51:30.73319
3	王小姐	邊境牧羊犬主人	5	第二次來小基基購買狗狗了！品質真的沒話說，價格公道，最重要的是狗狗們都有完整的疫苗接種記錄。推薦給想要養狗的朋友們！	images/download.jpg	t	2025-07-11 14:51:30.73319	2025-07-11 14:51:30.73319
4	張先生	柴犬主人	5	老闆超有耐心！第一次養狗什麼都不懂，老闆詳細解說了飲食、訓練等各種注意事項。LINE隨時都可以諮詢，真的很貼心！	images/download-2.jpg	t	2025-07-11 14:51:30.73319	2025-07-11 14:51:30.73319
\.


--
-- Name: inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.inquiries_id_seq', 1, false);


--
-- Name: pets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pets_id_seq', 4, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 8, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 4, true);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: idx_inquiries_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_inquiries_created_at ON public.inquiries USING btree (created_at);


--
-- Name: idx_inquiries_is_read; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_inquiries_is_read ON public.inquiries USING btree (is_read);


--
-- Name: idx_pets_category; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_pets_category ON public.pets USING btree (category);


--
-- Name: idx_pets_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_pets_created_at ON public.pets USING btree (created_at);


--
-- Name: idx_testimonials_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_testimonials_created_at ON public.testimonials USING btree (created_at);


--
-- Name: idx_testimonials_is_active; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_testimonials_is_active ON public.testimonials USING btree (is_active);


--
-- PostgreSQL database dump complete
--

