-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'USER',
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "experiencia" INTEGER NOT NULL DEFAULT 0,
    "victorias" INTEGER NOT NULL DEFAULT 0,
    "derrotas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "vida" INTEGER NOT NULL,
    "ataque" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL,
    "nivelMinimoObtencion" INTEGER NOT NULL DEFAULT 1,
    "imagen" TEXT,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nick_key" ON "User"("nick");
