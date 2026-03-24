<?php

namespace Database\Seeders;

use App\Models\Breed;
use Illuminate\Database\Seeder;

class BreedsSeeder extends Seeder
{
    public function run(): void
    {
        $dogs = [
            ['name_ro' => 'Labrador Retriever',     'name_ru' => 'Лабрадор-ретривер',    'species' => 'dog'],
            ['name_ro' => 'Golden Retriever',        'name_ru' => 'Золотистый ретривер',  'species' => 'dog'],
            ['name_ro' => 'Ciobănesc German',        'name_ru' => 'Немецкая овчарка',     'species' => 'dog'],
            ['name_ro' => 'Bulldog Francez',         'name_ru' => 'Французский бульдог',  'species' => 'dog'],
            ['name_ro' => 'Bulldog Englez',          'name_ru' => 'Английский бульдог',   'species' => 'dog'],
            ['name_ro' => 'Pudel',                   'name_ru' => 'Пудель',               'species' => 'dog'],
            ['name_ro' => 'Beagle',                  'name_ru' => 'Бигль',                'species' => 'dog'],
            ['name_ro' => 'Rottweiler',              'name_ru' => 'Ротвейлер',            'species' => 'dog'],
            ['name_ro' => 'Yorkshire Terrier',       'name_ru' => 'Йоркширский терьер',   'species' => 'dog'],
            ['name_ro' => 'Dachshund',               'name_ru' => 'Такса',                'species' => 'dog'],
            ['name_ro' => 'Boxer',                   'name_ru' => 'Боксёр',               'species' => 'dog'],
            ['name_ro' => 'Husky Siberian',          'name_ru' => 'Сибирский хаски',      'species' => 'dog'],
            ['name_ro' => 'Doberman',                'name_ru' => 'Доберман',             'species' => 'dog'],
            ['name_ro' => 'Shih Tzu',                'name_ru' => 'Ши-тцу',              'species' => 'dog'],
            ['name_ro' => 'Pomeranian',              'name_ru' => 'Померанский шпиц',     'species' => 'dog'],
            ['name_ro' => 'Chow Chow',               'name_ru' => 'Чау-чау',             'species' => 'dog'],
            ['name_ro' => 'Maltez',                  'name_ru' => 'Бишон мальтезе',       'species' => 'dog'],
            ['name_ro' => 'Samoyed',                 'name_ru' => 'Самоед',               'species' => 'dog'],
            ['name_ro' => 'Border Collie',           'name_ru' => 'Бордер-колли',         'species' => 'dog'],
            ['name_ro' => 'Dalmatian',               'name_ru' => 'Далматин',             'species' => 'dog'],
        ];

        $cats = [
            ['name_ro' => 'Pisică Persană',          'name_ru' => 'Персидская кошка',     'species' => 'cat'],
            ['name_ro' => 'Maine Coon',              'name_ru' => 'Мейн-кун',            'species' => 'cat'],
            ['name_ro' => 'Siameză',                 'name_ru' => 'Сиамская кошка',       'species' => 'cat'],
            ['name_ro' => 'British Shorthair',       'name_ru' => 'Британская короткошёрстная', 'species' => 'cat'],
            ['name_ro' => 'Ragdoll',                 'name_ru' => 'Рэгдолл',             'species' => 'cat'],
            ['name_ro' => 'Bengal',                  'name_ru' => 'Бенгальская кошка',    'species' => 'cat'],
            ['name_ro' => 'Scottish Fold',           'name_ru' => 'Шотландская вислоухая', 'species' => 'cat'],
            ['name_ro' => 'Sphynx',                  'name_ru' => 'Сфинкс',              'species' => 'cat'],
            ['name_ro' => 'Abisiniană',              'name_ru' => 'Абиссинская кошка',    'species' => 'cat'],
            ['name_ro' => 'Russian Blue',            'name_ru' => 'Русская голубая',      'species' => 'cat'],
        ];

        foreach (array_merge($dogs, $cats) as $breed) {
            Breed::firstOrCreate(
                ['name_ro' => $breed['name_ro'], 'species' => $breed['species']],
                $breed
            );
        }
    }
}
