-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "postcode" VARCHAR(20) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "street_l1" VARCHAR(255) NOT NULL,
    "street_l2" VARCHAR(255),
    "longitude" DECIMAL(9,6),
    "latitude" DECIMAL(9,6),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
